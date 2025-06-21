import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  RotateCcw, 
  Check, 
  X, 
  Brain, 
  Clock, 
  Target,
  Star,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import toast from 'react-hot-toast';

const Flashcards: React.FC = () => {
  const { flashcards, addFlashcard, updateFlashcard, deleteFlashcard, getFlashcardsForReview } = useDataStore();
  
  const [currentMode, setCurrentMode] = useState<'review' | 'create' | 'browse'>('review');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    tags: '',
  });

  const reviewCards = getFlashcardsForReview();
  const currentCard = reviewCards[currentCardIndex];

  const allTags = Array.from(new Set(flashcards.flatMap(card => card.tags)));

  const filteredCards = flashcards.filter(card => {
    const matchesSearch = card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.back.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || card.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleAnswer = (correct: boolean) => {
    if (!currentCard) return;

    const nextReview = new Date();
    const difficultyMultiplier = correct ? currentCard.difficulty + 1 : Math.max(1, currentCard.difficulty - 1);
    nextReview.setDate(nextReview.getDate() + difficultyMultiplier);

    updateFlashcard(currentCard.id, {
      lastReviewed: new Date(),
      nextReview,
      difficulty: difficultyMultiplier,
      correctCount: correct ? currentCard.correctCount + 1 : currentCard.correctCount,
      incorrectCount: correct ? currentCard.incorrectCount : currentCard.incorrectCount + 1,
    });

    setShowAnswer(false);
    
    if (currentCardIndex < reviewCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      toast.success('Review session completed!');
      setCurrentCardIndex(0);
    }
  };

  const handleCreateCard = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      toast.error('Please fill in both front and back of the card');
      return;
    }

    const tags = newCard.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    addFlashcard({
      id: Date.now().toString(),
      front: newCard.front,
      back: newCard.back,
      tags,
      difficulty: 1,
      lastReviewed: new Date(),
      nextReview: new Date(),
      correctCount: 0,
      incorrectCount: 0,
      createdAt: new Date()
    });

    setNewCard({ front: '', back: '', tags: '' });
    toast.success('Flashcard created successfully!');
  };

  const nextCard = () => {
    if (currentCardIndex < reviewCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flashcards</h1>
          <p className="text-gray-600">Master medical concepts with spaced repetition</p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentMode('review')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentMode === 'review'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Review ({reviewCards.length})
          </button>
          <button
            onClick={() => setCurrentMode('create')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentMode === 'create'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setCurrentMode('browse')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentMode === 'browse'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Browse ({flashcards.length})
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
          <div className="text-2xl font-bold text-gray-900">{flashcards.length}</div>
          <div className="text-sm text-gray-600">Total Cards</div>
        </div>
        <div className="card text-center">
          <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{reviewCards.length}</div>
          <div className="text-sm text-gray-600">Due for Review</div>
        </div>
        <div className="card text-center">
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {flashcards.length > 0 
              ? Math.round((flashcards.reduce((acc, card) => acc + card.correctCount, 0) / 
                  Math.max(1, flashcards.reduce((acc, card) => acc + card.correctCount + card.incorrectCount, 0))) * 100)
              : 0}%
          </div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>
        <div className="card text-center">
          <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-600">Study Streak</div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {currentMode === 'review' && (
          <div className="max-w-2xl mx-auto">
            {reviewCards.length > 0 ? (
              <div className="space-y-6">
                {/* Progress */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Card {currentCardIndex + 1} of {reviewCards.length}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentCardIndex + 1) / reviewCards.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Flashcard */}
                <div 
                  className="relative h-80 cursor-pointer perspective-1000"
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  <motion.div
                    className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{ rotateY: showAnswer ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ 
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    {/* Front of card */}
                    <div 
                      className="absolute inset-0 p-8 flex items-center justify-center"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(0deg)'
                      }}
                    >
                        <div className="text-center">
                          <Brain className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 mb-6">
                            {currentCard?.front}
                          </h3>
                          <p className="text-gray-500">Click to reveal answer</p>
                        </div>
                    </div>
                    
                    {/* Back of card */}
                    <div 
                      className="absolute inset-0 p-8 flex items-center justify-center"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                        <div className="text-center">
                          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                          <div className="text-lg text-gray-900 leading-relaxed">
                            {currentCard?.back}
                          </div>
                        </div>
                    </div>
                  </motion.div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevCard}
                    disabled={currentCardIndex === 0}
                    className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {showAnswer && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleAnswer(false)}
                        className="flex items-center space-x-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <X className="w-5 h-5" />
                        <span>Incorrect</span>
                      </button>
                      <button
                        onClick={() => handleAnswer(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                        <span>Correct</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={nextCard}
                    disabled={currentCardIndex === reviewCards.length - 1}
                    className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Card Tags */}
                {currentCard?.tags && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {currentCard.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No cards due for review</h3>
                <p className="text-gray-600 mb-6">Great job! All your flashcards are up to date.</p>
                <button
                  onClick={() => setCurrentMode('create')}
                  className="btn-primary"
                >
                  Create New Cards
                </button>
              </div>
            )}
          </div>
        )}

        {currentMode === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Flashcard</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Front (Question)
                  </label>
                  <textarea
                    value={newCard.front}
                    onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                    className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Enter your question or prompt..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Back (Answer)
                  </label>
                  <textarea
                    value={newCard.back}
                    onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                    className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Enter the answer or explanation..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newCard.tags}
                    onChange={(e) => setNewCard({ ...newCard, tags: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="cardiology, anatomy, pharmacology..."
                  />
                </div>
                
                <button
                  onClick={handleCreateCard}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Flashcard</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
                  placeholder="Search flashcards..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Flashcards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((card) => (
                <div key={card.id} className="card hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {card.front}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {card.back}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Accuracy: {
                      card.correctCount + card.incorrectCount > 0
                        ? Math.round((card.correctCount / (card.correctCount + card.incorrectCount)) * 100)
                        : 0
                    }%</span>
                    <span>Level {card.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredCards.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No flashcards found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Flashcards;