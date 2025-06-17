import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Settings, 
  Info, 
  Trash2,
  Plus,
  Search,
  Filter,
  BookOpen,
  Clock,
  Target,
  Star,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useResearchStore } from '../stores/researchStore';
import { useAuthStore } from '../stores/authStore';
import { extractTextFromPDF, summarizeText } from '../lib/summarizer';

interface SummarySettings {
  maxChunkLength: number;
  summaryMinLength: number;
  summaryMaxLength: number;
}

const ResearchSummarizer: React.FC = () => {
  const { user } = useAuthStore();
  const { summaries, isLoading, error, createSummary, fetchSummaries, deleteSummary } = useResearchStore();
  const [currentMode, setCurrentMode] = useState<'create' | 'browse'>('create');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState<SummarySettings>({
    maxChunkLength: 1000,
    summaryMinLength: 40,
    summaryMaxLength: 150,
  });

  useEffect(() => {
    console.log('Fetching summaries from database...');
    fetchSummaries().then(() => {
      console.log('Summaries fetched successfully');
    }).catch((error) => {
      console.error('Error fetching summaries:', error);
    });
  }, [fetchSummaries]);

  useEffect(() => {
    if (isProcessing) {
      console.log('Currently processing summary...');
    }
  }, [isProcessing]);

  useEffect(() => {
    if (error) {
      console.error('Research store error:', error);
    }
  }, [error]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setSummary('');
    } else {
      toast.error('Please upload a valid PDF file');
    }
  };

  const handleGenerateSummary = async () => {
    if (!file) {
      toast.error('Please upload a PDF file first');
      return;
    }

    setIsProcessing(true);
    console.log('Starting summary generation for file:', file.name);
    try {
      // Extract text from PDF
      console.log('Extracting text from PDF...');
      const text = await extractTextFromPDF(file);
      console.log('Text extracted successfully');

      // Generate summary
      console.log('Generating summary with settings:', settings);
      const summary = await summarizeText(
        text,
        settings.maxChunkLength,
        settings.summaryMinLength,
        settings.summaryMaxLength
      );
      console.log('Summary generated successfully');
      
      // Save to database
      console.log('Saving summary to database...');
      await createSummary({
        paper_title: file.name.replace('.pdf', ''),
        original_text: text,
        summary_text: summary,
        chunk_length: settings.maxChunkLength,
        summary_min_length: settings.summaryMinLength,
        summary_max_length: settings.summaryMaxLength,
        model_used: 'facebook/bart-large-cnn',
        user_id: user?.id || '',
      });
      console.log('Summary saved successfully to database');

      setSummary(summary);
      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error('Error during summary generation:', error);
      toast.error('Failed to generate summary');
    } finally {
      setIsProcessing(false);
      console.log('Summary generation process completed');
    }
  };

  const handleDownload = () => {
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

  const handleDeleteSummary = async (id: string) => {
    console.log('Attempting to delete summary with ID:', id);
    try {
      await deleteSummary(id);
      console.log('Summary deleted successfully from database');
      toast.success('Summary deleted successfully');
    } catch (error) {
      console.error('Error deleting summary:', error);
      toast.error('Failed to delete summary');
    }
  };

  const filteredSummaries = summaries.filter(summary =>
    summary.paper_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.summary_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Summarizer</h1>
          <p className="text-gray-600">Generate AI-powered summaries of research papers</p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentMode('create')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentMode === 'create'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Create New
          </button>
          <button
            onClick={() => setCurrentMode('browse')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentMode === 'browse'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Browse ({summaries.length})
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <div className="card text-center">
          <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{summaries.length}</div>
          <div className="text-sm text-gray-600">Total Summaries</div>
        </div>
        <div className="card text-center">
          <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {summaries.length > 0 
              ? new Date(summaries[0].created_at).toLocaleDateString()
              : '-'}
          </div>
          <div className="text-sm text-gray-600">Last Summary</div>
        </div>
        <div className="card text-center">
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {summaries.length > 0 
              ? Math.round(summaries.reduce((acc, summary) => acc + summary.summary_text.length, 0) / summaries.length)
              : 0}
          </div>
          <div className="text-sm text-gray-600">Avg. Summary Length</div>
        </div>
        <div className="card text-center">
          <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {user?.stats?.researchSummariesCreated || 0}
          </div>
          <div className="text-sm text-gray-600">Summaries Created</div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {currentMode === 'create' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Upload and Settings */}
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Paper</h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer"
                    >
                      {file ? (
                        <div className="space-y-2">
                          <FileText className="w-12 h-12 text-primary-600 mx-auto" />
                          <p className="text-gray-900 font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">Click to change file</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                          <p className="text-gray-900 font-medium">Click to upload PDF</p>
                          <p className="text-sm text-gray-500">or drag and drop</p>
                        </div>
                      )}
                    </label>
                  </div>

                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Summary Settings</span>
                  </button>

                  {showSettings && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Chunk Length
                        </label>
                        <input
                          type="number"
                          value={settings.maxChunkLength}
                          onChange={(e) => setSettings({
                            ...settings,
                            maxChunkLength: parseInt(e.target.value)
                          })}
                          className="w-full p-2 border border-gray-200 rounded-lg"
                          min="100"
                          max="2000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Summary Length
                        </label>
                        <input
                          type="number"
                          value={settings.summaryMinLength}
                          onChange={(e) => setSettings({
                            ...settings,
                            summaryMinLength: parseInt(e.target.value)
                          })}
                          className="w-full p-2 border border-gray-200 rounded-lg"
                          min="10"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Summary Length
                        </label>
                        <input
                          type="number"
                          value={settings.summaryMaxLength}
                          onChange={(e) => setSettings({
                            ...settings,
                            summaryMaxLength: parseInt(e.target.value)
                          })}
                          className="w-full p-2 border border-gray-200 rounded-lg"
                          min="50"
                          max="500"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleGenerateSummary}
                    disabled={!file || isProcessing}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating Summary...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        <span>Generate Summary</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Current Summary */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Summary</h2>
              {isProcessing ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : summary ? (
                <div className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Summary</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>Upload a PDF and generate a summary to see it here</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search summaries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Summary List */}
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : filteredSummaries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSummaries.map((summary) => (
                  <div
                    key={summary.id}
                    className="card hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{summary.paper_title}</h3>
                        {summary.paper_author && (
                          <p className="text-sm text-gray-500 mb-2">By {summary.paper_author}</p>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-3">{summary.summary_text}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(summary.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSummary(summary.summary_text);
                                setCurrentMode('create');
                              }}
                              className="text-sm text-primary-600 hover:text-primary-700"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteSummary(summary.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'No summaries found matching your search' : 'No summaries yet. Generate your first summary!'}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResearchSummarizer; 