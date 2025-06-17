import { pipeline, env } from '@xenova/transformers';
import * as pdfjsLib from 'pdfjs-dist';

// Configure Transformers.js
env.localModelPath = '/models';
env.allowRemoteModels = false;

// Initialize PDF.js worker
const workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).href;
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

let summarizer: any = null;

export async function loadSummarizer(modelName: string = "Xenova/distilbart-cnn-6-6") {
  if (!summarizer) {
    console.log('Loading summarizer model:', modelName);
    try {
      // Initialize the pipeline with specific options
      summarizer = await pipeline('summarization', modelName, {
        quantized: true,
        progress_callback: (progress: number) => {
          console.log(`Loading model: ${Math.round(progress * 100)}%`);
        }
      });
      console.log('Summarizer model loaded successfully');
    } catch (error) {
      console.error('Error loading summarizer model:', error);
      throw new Error('Failed to load summarizer model');
    }
  }
  return summarizer;
}

interface Sentence {
  text: string;
  score: number;
  position: number;
  section?: string;
}

interface Section {
  name: string;
  sentences: Sentence[];
}

// Research paper specific keywords and their weights
const KEYWORDS = {
  methodology: ['method', 'approach', 'technique', 'procedure', 'experiment', 'study', 'analysis', 'evaluation'],
  results: ['result', 'finding', 'outcome', 'conclusion', 'demonstrate', 'show', 'prove', 'indicate', 'reveal'],
  importance: ['important', 'significant', 'crucial', 'essential', 'key', 'critical', 'vital', 'fundamental'],
  novelty: ['novel', 'new', 'innovative', 'original', 'unique', 'unprecedented', 'groundbreaking'],
  impact: ['impact', 'effect', 'influence', 'contribution', 'implication', 'application', 'relevance'],
  limitation: ['limitation', 'constraint', 'challenge', 'drawback', 'weakness', 'restriction'],
  future: ['future', 'further', 'next', 'prospect', 'potential', 'recommendation', 'suggestion']
};

// Section headers commonly found in research papers
const SECTION_HEADERS = [
  'abstract', 'introduction', 'background', 'related work', 'literature review',
  'methodology', 'methods', 'approach', 'experimental setup', 'implementation',
  'results', 'findings', 'analysis', 'discussion', 'evaluation',
  'conclusion', 'future work', 'limitations', 'recommendations'
];

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Starting PDF text extraction...', { fileName: file.name, fileSize: file.size });
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('File converted to ArrayBuffer');
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    console.log('PDF loading task created');
    
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded successfully. Total pages: ${pdf.numPages}`);
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i}/${pdf.numPages}`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
      console.log(`Page ${i} text length: ${pageText.length} characters`);
    }
    
    console.log('PDF text extraction completed successfully', {
      totalTextLength: fullText.length,
      preview: fullText.substring(0, 200) + '...'
    });
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

function splitIntoSentences(text: string): string[] {
  // Enhanced sentence splitting that handles more cases
  return text
    .replace(/([.!?])\s+/g, '$1|')
    .replace(/([.!?])\n/g, '$1|')
    .replace(/([.!?])\t/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !/^\d+$/.test(s)); // Filter out single numbers
}

function detectSection(sentence: string): string | undefined {
  const lowerSentence = sentence.toLowerCase();
  for (const header of SECTION_HEADERS) {
    if (lowerSentence.includes(header)) {
      return header;
    }
  }
  return undefined;
}

function calculateKeywordScore(sentence: string): number {
  let score = 0;
  const lowerSentence = sentence.toLowerCase();
  
  // Check each category of keywords
  for (const [category, words] of Object.entries(KEYWORDS)) {
    for (const word of words) {
      if (lowerSentence.includes(word)) {
        // Give higher weight to methodology and results keywords
        if (category === 'methodology' || category === 'results') {
          score += 2;
        } else {
          score += 1;
        }
      }
    }
  }
  
  return score;
}

function calculateSentenceScore(sentence: string, position: number, totalSentences: number): number {
  let score = 0;
  
  // Length score (prefer medium-length sentences)
  const length = sentence.length;
  if (length > 30 && length < 150) {
    score += 2;
  } else if (length >= 150 && length < 250) {
    score += 1;
  }
  
  // Position score (prefer sentences from the beginning and end)
  const relativePosition = position / totalSentences;
  if (relativePosition < 0.2) { // First 20%
    score += 3;
  } else if (relativePosition > 0.8) { // Last 20%
    score += 2;
  }
  
  // Keyword score
  score += calculateKeywordScore(sentence);
  
  // Title case score (sentences that start with capital letters)
  if (/^[A-Z]/.test(sentence)) {
    score += 0.5;
  }
  
  // Numerical content score (sentences with numbers might be important)
  if (/\d+/.test(sentence)) {
    score += 0.5;
  }
  
  return score;
}

function organizeIntoSections(sentences: Sentence[]): Section[] {
  const sections: Section[] = [];
  let currentSection = 'introduction';
  
  for (const sentence of sentences) {
    const detectedSection = detectSection(sentence.text);
    if (detectedSection) {
      currentSection = detectedSection;
    }
    
    let section = sections.find(s => s.name === currentSection);
    if (!section) {
      section = { name: currentSection, sentences: [] };
      sections.push(section);
    }
    section.sentences.push(sentence);
  }
  
  return sections;
}

export function summarizeText(
  text: string,
  maxLength: number = 500,
  minLength: number = 100
): string {
  try {
    console.log('Starting text summarization...', {
      inputTextLength: text.length,
      maxLength,
      minLength
    });
    
    // Split text into sentences
    const sentences = splitIntoSentences(text);
    console.log(`Text split into ${sentences.length} sentences`, {
      firstSentence: sentences[0],
      lastSentence: sentences[sentences.length - 1]
    });
    
    // Calculate scores for each sentence
    const scoredSentences: Sentence[] = sentences.map((sentence, index) => {
      const score = calculateSentenceScore(sentence, index, sentences.length);
      return {
        text: sentence,
        score,
        position: index
      };
    });
    
    console.log('Sentence scoring completed', {
      highestScore: Math.max(...scoredSentences.map(s => s.score)),
      lowestScore: Math.min(...scoredSentences.map(s => s.score)),
      averageScore: scoredSentences.reduce((acc, s) => acc + s.score, 0) / scoredSentences.length
    });
    
    // Organize sentences into sections
    const sections = organizeIntoSections(scoredSentences);
    console.log(`Text organized into ${sections.length} sections`, {
      sectionNames: sections.map(s => s.name),
      sentencesPerSection: sections.map(s => s.sentences.length)
    });
    
    // Select sentences from each section
    let summary = '';
    let currentLength = 0;
    
    for (const section of sections) {
      console.log(`Processing section: ${section.name}`, {
        sentencesInSection: section.sentences.length
      });
      
      // Sort sentences within the section by score
      section.sentences.sort((a, b) => b.score - a.score);
      
      // Select top sentences from each section
      const sectionSentences = section.sentences.slice(0, 2);
      console.log(`Selected ${sectionSentences.length} sentences from ${section.name}`, {
        sentences: sectionSentences.map(s => ({
          text: s.text.substring(0, 50) + '...',
          score: s.score
        }))
      });
      
      for (const sentence of sectionSentences) {
        if (currentLength + sentence.text.length > maxLength) {
          console.log('Reached maximum length limit');
          break;
        }
        
        if (summary) {
          summary += ' ';
        }
        summary += sentence.text;
        currentLength += sentence.text.length;
        
        if (currentLength >= minLength) {
          console.log('Reached minimum length requirement');
          break;
        }
      }
      
      if (currentLength >= minLength) {
        break;
      }
    }
    
    // If we haven't reached the minimum length, add more sentences
    if (currentLength < minLength) {
      console.log('Adding more sentences to reach minimum length', {
        currentLength,
        minLength
      });
      
      const allSentences = scoredSentences
        .sort((a, b) => b.score - a.score)
        .filter(s => !summary.includes(s.text));
      
      for (const sentence of allSentences) {
        if (currentLength + sentence.text.length > maxLength) {
          break;
        }
        
        if (summary) {
          summary += ' ';
        }
        summary += sentence.text;
        currentLength += sentence.text.length;
        
        if (currentLength >= minLength) {
          break;
        }
      }
    }
    
    console.log('Text summarization completed successfully', {
      summaryLength: summary.length,
      summary: summary
    });
    return summary;
  } catch (error) {
    console.error('Error summarizing text:', error);
    throw new Error('Failed to summarize text');
  }
} 