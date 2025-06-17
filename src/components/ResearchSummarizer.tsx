import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, Download } from 'lucide-react';
import { loadSummarizer, extractTextFromPDF, chunkText, summarizeText } from '@/lib/summarizer';
import { useToast } from '@/components/ui/use-toast';
import { useResearchStore } from '@/stores/researchStore';
import { useAuthStore } from '@/stores/authStore';

export function ResearchSummarizer() {
  const { user } = useAuthStore();
  const { createSummary } = useResearchStore();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [settings, setSettings] = useState({
    maxChunkLength: 1000,
    summaryMinLength: 40,
    summaryMaxLength: 150,
  });
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string>('');
  const [mnemonics, setMnemonics] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    console.log('File selected:', {
      name: selectedFile?.name,
      type: selectedFile?.type,
      size: selectedFile?.size
    });
    
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        console.error('Invalid file type:', selectedFile.type);
        setError('Please upload a PDF file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSummary('');
      setExtractedText('');
      setShowExtractedText(false);
    }
  };

  const handleSettingsChange = (key: keyof typeof settings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateSummary = async () => {
    if (!file) {
      console.error('No file selected');
      setError('Please upload a PDF file first');
      return;
    }

    try {
      console.log('Starting summary generation process');
      setIsLoading(true);
      setError(null);
      setSummary('');
      setProgress(0);

      // Extract text from PDF
      console.log('Extracting text from PDF...');
      const text = await extractTextFromPDF(file);
      console.log('Text extraction completed', {
        textLength: text.length,
        preview: text.substring(0, 200) + '...'
      });
      setExtractedText(text);
      setShowExtractedText(true);
      setProgress(50);

      // Generate summary
      console.log('Generating summary...');
      const generatedSummary = summarizeText(text);
      console.log('Summary generation completed', {
        summaryLength: generatedSummary.length,
        summary: generatedSummary
      });
      setProgress(100);
      setSummary(generatedSummary);

      // Save to database with deadline and mnemonics
      console.log('Saving summary to database...');
      await createSummary({
        paper_title: file.name.replace('.pdf', ''),
        original_text: text,
        summary_text: generatedSummary,
        chunk_length: 1000,
        summary_min_length: 40,
        summary_max_length: 150,
        model_used: 'facebook/bart-large-cnn',
        user_id: user?.id || '',
        deadline: deadline || undefined,
        mnemonics: mnemonics ? mnemonics.split(',').map(m => m.trim()) : undefined
      });
      console.log('Summary saved successfully to database');

      toast({
        title: 'Summary generated',
        description: 'The research paper has been summarized successfully.',
      });
    } catch (error) {
      console.error('Error during summary generation:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate summary');
      toast({
        title: 'Error',
        description: 'Failed to generate summary. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      console.log('Summary generation process completed');
    }
  };

  const downloadSummary = () => {
    if (!summary) return;
    
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Research Paper Summarizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload PDF</Label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Deadline (Optional)</Label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Mnemonics (Optional, comma-separated)</Label>
                <input
                  type="text"
                  value={mnemonics}
                  onChange={(e) => setMnemonics(e.target.value)}
                  placeholder="Enter mnemonics separated by commas"
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Chunk Length (characters)</Label>
                  <Slider
                    value={[settings.maxChunkLength]}
                    min={500}
                    max={2000}
                    step={100}
                    onValueChange={([value]) => handleSettingsChange('maxChunkLength', value)}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-muted-foreground">{settings.maxChunkLength} characters</span>
                </div>

                <div className="space-y-2">
                  <Label>Summary Minimum Length</Label>
                  <Slider
                    value={[settings.summaryMinLength]}
                    min={20}
                    max={100}
                    step={5}
                    onValueChange={([value]) => handleSettingsChange('summaryMinLength', value)}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-muted-foreground">{settings.summaryMinLength} words</span>
                </div>

                <div className="space-y-2">
                  <Label>Summary Maximum Length</Label>
                  <Slider
                    value={[settings.summaryMaxLength]}
                    min={50}
                    max={300}
                    step={10}
                    onValueChange={([value]) => handleSettingsChange('summaryMaxLength', value)}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-muted-foreground">{settings.summaryMaxLength} words</span>
                </div>
              </div>

              <Button
                onClick={handleGenerateSummary}
                disabled={!file || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  'Generate Summary'
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {isLoading && (
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {showExtractedText && (
                <div className="space-y-2">
                  <Label>Extracted Text Preview</Label>
                  <Textarea
                    value={extractedText.slice(0, 1000) + (extractedText.length > 1000 ? '...' : '')}
                    readOnly
                    className="h-32"
                  />
                </div>
              )}

              {summary && (
                <div className="space-y-2">
                  <Label>Summary</Label>
                  <Textarea
                    value={summary}
                    readOnly
                    className="h-64"
                  />
                  <Button
                    onClick={downloadSummary}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Summary
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 