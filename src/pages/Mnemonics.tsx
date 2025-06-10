import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Plus, 
  Search, 
  Filter, 
  Brain, 
  Zap, 
  BookOpen, 
  Star,
  Copy,
  Check,
  Sparkles,
  Wand2,
  Smile,
  Briefcase,
  Palette
} from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const Mnemonics: React.FC = () => {
  const { mnemonics, addMnemonic, generateAIMnemonic } = useDataStore();
  const { user } = useAuthStore();
  
  const [currentMode, setCurrentMode] = useState<'browse' | 'create' | 'generate'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newMnemonic, setNewMnemonic] = useState({
    term: '',
    mnemonic: '',
    explanation: '',
    category: '',
    tags: '',
  });

  const [generateForm, setGenerateForm] = useState({
    term: '',
    style: 'funny' as 'funny' | 'professional' | 'creative',
  });
  
  const [generatedMnemonic, setGeneratedMnemonic] = useState<{
    mnemonic: string;
    explanation: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const categories = Array.from(new Set(mnemonics.map(m => m.category)));
  
  const filteredMnemonics = mnemonics.filter(mnemonic => {
    const matchesSearch = mnemonic.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mnemonic.mnemonic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mnemonic.explanation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || mnemonic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateMnemonic = () => {
    if (!newMnemonic.term.trim() || !newMnemonic.mnemonic.trim()) {
      toast.error('Please fill in term and mnemonic');
      return;
    }

    const tags = newMnemonic.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    addMnemonic({
      term: newMnemonic.term,
      mnemonic: newMnemonic.mnemonic,
      explanation: newMnemonic.explanation,
      category: newMnemonic.category || 'General',
      tags,
      isCustom: true,
    });

    setNewMnemonic({
      term: '',
      mnemonic: '',
      explanation: '',
      category: '',
      tags: '',
    });
    
    toast.success('Mnemonic created successfully!');
    setCurrentMode('browse');
  };

  const handleGenerateMnemonic = async () => {
    if (!generateForm.term.trim()) {
      toast.error('Please enter a term to generate a mnemonic for');
      return;
    }

    // Check if user has reached generation limit (for free users)
    if (!user?.isPro && (user?.stats?.aiGenerationsUsed || 0) >= 5) {
      toast.error('Free users are limited to 5 AI generations per month. Upgrade to Pro for unlimited access!');
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await generateAIMnemonic(generateForm.term, generateForm.style);
      setGeneratedMnemonic(result);
      toast.success('AI mnemonic generated!');
    } catch (error) {
      console.error('Error generating mnemonic:', error);
      toast.error('Failed to generate mnemonic. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMnemonic = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveGeneratedMnemonic = () => {
    if (!generateForm.term.trim() || !generatedMnemonic) return;

    addMnemonic({
      term: generateForm.term,
      mnemonic: generatedMnemonic.mnemonic,
      explanation: generatedMnemonic.explanation,
      category: 'AI Generated',
      tags: ['ai-generated', generateForm.style],
      isCustom: true,
    });

    setGenerateForm({ term: '', style: 'funny' });
    setGeneratedMnemonic(null);
    toast.success('Generated mnemonic saved!');
    setCurrentMode('browse');
  };

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'funny': return Smile;
      case 'professional': return Briefcase;
      case 'creative': return Palette;
      default: return Sparkles;
    }
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'funny': return 'from-yellow-500 to-orange-500';
      case 'professional': return 'from-blue-500 to-indigo-500';
      case 'creative': return 'from-purple-500 to-pink-500';
      default: return 'from-green-500 to-teal-500';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mnemonics</h1>
          <p className="text-gray-600">Enhance memory with powerful mnemonic devices</p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentMode('browse')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentMode === 'browse'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Browse ({mnemonics.length})
          </button>
          <button
            onClick={() => setCurrentMode('generate')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              currentMode === 'generate'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>AI Generate</span>
            {!user?.isPro && (
              <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">
                {5 - (user?.stats?.aiGenerationsUsed || 0)}/5
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentMode('create')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              currentMode === 'create'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
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
          <Lightbulb className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{mnemonics.length}</div>
          <div className="text-sm text-gray-600">Total Mnemonics</div>
        </div>
        <div className="card text-center">
          <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="card text-center">
          <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {mnemonics.filter(m => m.isCustom).length}
          </div>
          <div className="text-sm text-gray-600">Custom Created</div>
        </div>
        <div className="card text-center">
          <Sparkles className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{user?.stats?.aiGenerationsUsed || 0}</div>
          <div className="text-sm text-gray-600">AI Generated</div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {currentMode === 'browse' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search mnemonics..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mnemonics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMnemonics.map((mnemonic) => (
                <div key={mnemonic.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-gray-900">{mnemonic.term}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {mnemonic.isCustom && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                      {mnemonic.tags.includes('ai-generated') && (
                        <Sparkles className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-lg font-medium text-primary-600 mb-2 font-mono">
                      "{mnemonic.mnemonic}"
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {mnemonic.explanation}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {mnemonic.category}
                      </span>
                      {mnemonic.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handleCopyMnemonic(mnemonic.mnemonic, mnemonic.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copiedId === mnemonic.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredMnemonics.length === 0 && (
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No mnemonics found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or create a new mnemonic.</p>
                <button
                  onClick={() => setCurrentMode('create')}
                  className="btn-primary"
                >
                  Create Your First Mnemonic
                </button>
              </div>
            )}
          </div>
        )}

        {currentMode === 'generate' && (
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Mnemonic Generator</h2>
                <p className="text-gray-600">Let AI create powerful memory aids for any medical term</p>
                
                {!user?.isPro && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Free users get 5 AI generations per month. 
                      You have <strong>{5 - (user?.stats?.aiGenerationsUsed || 0)}</strong> remaining.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter a medical term or concept
                  </label>
                  <input
                    type="text"
                    value={generateForm.term}
                    onChange={(e) => setGenerateForm({ ...generateForm, term: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Cranial nerves, Heart murmurs, Antibiotics..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose generation style
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['funny', 'professional', 'creative'] as const).map((style) => {
                      const Icon = getStyleIcon(style);
                      return (
                        <button
                          key={style}
                          onClick={() => setGenerateForm({ ...generateForm, style })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            generateForm.style === style
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                          <span className="text-sm font-medium capitalize">{style}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <button
                  onClick={handleGenerateMnemonic}
                  disabled={!generateForm.term.trim() || isGenerating || (!user?.isPro && (user?.stats?.aiGenerationsUsed || 0) >= 5)}
                  className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Generate {generateForm.style} Mnemonic</span>
                    </>
                  )}
                </button>
                
                {generatedMnemonic && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 bg-gradient-to-r ${getStyleColor(generateForm.style)} bg-opacity-10 rounded-lg border border-opacity-20`}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-800">Generated {generateForm.style} Mnemonic</span>
                    </div>
                    <div className="text-lg font-medium text-gray-900 mb-3 font-mono">
                      "{generatedMnemonic.mnemonic}"
                    </div>
                    <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                      {generatedMnemonic.explanation}
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleCopyMnemonic(generatedMnemonic.mnemonic, 'generated')}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={saveGeneratedMnemonic}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Save to Library</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentMode === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Mnemonic</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term or Concept
                  </label>
                  <input
                    type="text"
                    value={newMnemonic.term}
                    onChange={(e) => setNewMnemonic({ ...newMnemonic, term: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter the term you want to remember"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mnemonic Device
                  </label>
                  <input
                    type="text"
                    value={newMnemonic.mnemonic}
                    onChange={(e) => setNewMnemonic({ ...newMnemonic, mnemonic: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your mnemonic phrase"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation
                  </label>
                  <textarea
                    value={newMnemonic.explanation}
                    onChange={(e) => setNewMnemonic({ ...newMnemonic, explanation: e.target.value })}
                    className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Explain how the mnemonic works"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={newMnemonic.category}
                      onChange={(e) => setNewMnemonic({ ...newMnemonic, category: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Anatomy, Cardiology"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newMnemonic.tags}
                      onChange={(e) => setNewMnemonic({ ...newMnemonic, tags: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="memory, clinical, exam"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleCreateMnemonic}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Mnemonic</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Mnemonics;