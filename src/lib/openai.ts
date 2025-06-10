// OpenAI integration for AI mnemonic generation
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface MnemonicGenerationRequest {
  term: string;
  style?: 'funny' | 'professional' | 'creative';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface MnemonicGenerationResponse {
  mnemonic: string;
  explanation: string;
  tokensUsed: number;
}

export const generateMnemonic = async (
  request: MnemonicGenerationRequest
): Promise<MnemonicGenerationResponse> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const { term, style = 'funny', difficulty = 'intermediate' } = request;

  const systemPrompt = `You are a medical education expert who creates memorable mnemonics for medical students. 
Your task is to create ${style} mnemonics that help students remember complex medical concepts.

Guidelines:
- Make mnemonics that are ${style} and memorable
- Ensure they are appropriate for ${difficulty} level students
- Include a clear explanation of how the mnemonic maps to the concept
- Keep mnemonics concise but effective
- For funny mnemonics, use humor that's educational and appropriate`;

  const userPrompt = `Create a ${style} mnemonic for: "${term}"

Please provide:
1. A memorable mnemonic phrase
2. A clear explanation of how each part relates to the medical concept
3. Any additional memory tips

Format your response as JSON with keys: "mnemonic", "explanation"`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: style === 'funny' ? 0.8 : 0.6,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    try {
      const parsed = JSON.parse(content);
      return {
        mnemonic: parsed.mnemonic,
        explanation: parsed.explanation,
        tokensUsed: data.usage?.total_tokens || 0,
      };
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        mnemonic: content.split('\n')[0] || content.substring(0, 100),
        explanation: content,
        tokensUsed: data.usage?.total_tokens || 0,
      };
    }
  } catch (error) {
    console.error('Error generating mnemonic:', error);
    throw error;
  }
};

// Alternative free AI service (if OpenAI is not available)
export const generateMnemonicFallback = (term: string, style: string = 'funny'): MnemonicGenerationResponse => {
  const funnyTemplates = [
    {
      mnemonic: `"${term}" = "Medical Students Always Remember Perfectly Every Detail"`,
      explanation: `This mnemonic helps you remember ${term} by associating each letter with medical study habits.`
    },
    {
      mnemonic: `"${term}" = "Doctors Never Forget Important Medical Knowledge"`,
      explanation: `Use this phrase to remember ${term} - each word represents a key concept.`
    },
    {
      mnemonic: `"${term}" = "Students Practice Medicine With Great Dedication"`,
      explanation: `This funny phrase helps memorize ${term} through relatable medical student experiences.`
    }
  ];

  const template = funnyTemplates[Math.floor(Math.random() * funnyTemplates.length)];
  
  return {
    mnemonic: template.mnemonic,
    explanation: template.explanation,
    tokensUsed: 0
  };
};