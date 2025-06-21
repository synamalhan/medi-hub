import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Edit, 
  Trash2,
  Filter,
  Search,
  SortAsc
} from 'lucide-react';
import { useDataStore } from '../stores/dataStore';
import { format, differenceInDays, isToday, isTomorrow, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const Deadlines: React.FC = () => {
  const { deadlines, addDeadline, updateDeadline, deleteDeadline } = useDataStore();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate');
  
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: 'exam' as const,
    priority: 'medium' as const,
  });

  const categories = [
    { value: 'exam', label: 'Exam' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'rotation', label: 'Rotation' },
    { value: 'application', label: 'Application' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const filteredAndSortedDeadlines = deadlines
    .filter(deadline => {
      const matchesSearch = deadline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deadline.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || deadline.category === filterCategory;
      const matchesPriority = !filterPriority || deadline.priority === filterPriority;
      const isIncomplete = !deadline.isCompleted;
      return matchesSearch && matchesCategory && matchesPriority && isIncomplete;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return a.dueDate.getTime() - b.dueDate.getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  const upcomingDeadlines = filteredAndSortedDeadlines.filter(d => !isPast(d.dueDate));
  const overdueDeadlines = filteredAndSortedDeadlines.filter(d => isPast(d.dueDate));

  const handleCreateDeadline = () => {
    if (!newDeadline.title.trim() || !newDeadline.dueDate) {
      toast.error('Please fill in title and due date');
      return;
    }

    addDeadline({
      id: Date.now().toString(),
      title: newDeadline.title,
      description: newDeadline.description,
      dueDate: new Date(newDeadline.dueDate),
      category: newDeadline.category,
      priority: newDeadline.priority,
      isCompleted: false,
      createdAt: new Date()
    });

    setNewDeadline({
      title: '',
      description: '',
      dueDate: '',
      category: 'exam',
      priority: 'medium',
    });
    setShowCreateForm(false);
    toast.success('Deadline created successfully!');
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await updateDeadline(id, { isCompleted: completed });
    toast.success(completed ? 'Deadline completed!' : 'Deadline reopened!');
    } catch (error) {
      console.error('Error updating deadline:', error);
      toast.error('Failed to update deadline');
    }
  };

  const handleDeleteDeadline = async (id: string) => {
    try {
      await deleteDeadline(id);
    toast.success('Deadline deleted!');
    } catch (error) {
      console.error('Error deleting deadline:', error);
      toast.error('Failed to delete deadline');
    }
  };

  const getTimeUntilDeadline = (dueDate: Date) => {
    if (isPast(dueDate)) return 'Overdue';
    if (isToday(dueDate)) return 'Due today';
    if (isTomorrow(dueDate)) return 'Due tomorrow';
    
    const days = differenceInDays(dueDate, new Date());
    return `${days} day${days === 1 ? '' : 's'} left`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDeadlineUrgency = (dueDate: Date) => {
    if (isPast(dueDate)) return 'border-l-red-500 bg-red-50';
    if (isToday(dueDate)) return 'border-l-orange-500 bg-orange-50';
    if (isTomorrow(dueDate)) return 'border-l-yellow-500 bg-yellow-50';
    
    const days = differenceInDays(dueDate, new Date());
    if (days <= 7) return 'border-l-blue-500 bg-blue-50';
    return 'border-l-gray-300 bg-white';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deadlines</h1>
          <p className="text-gray-600">Stay organized and never miss important dates</p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Deadline</span>
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-6"
      >
        <div className="card text-center">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{upcomingDeadlines.length}</div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="card text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{overdueDeadlines.length}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="card text-center">
          <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{filteredAndSortedDeadlines.length}</div>
          <div className="text-sm text-gray-600">Total Active</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search deadlines..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Priorities</option>
          {priorities.map((priority) => (
            <option key={priority.value} value={priority.value}>{priority.label}</option>
          ))}
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="created">Sort by Created</option>
        </select>
      </motion.div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Deadline</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newDeadline.title}
                  onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter deadline title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newDeadline.description}
                  onChange={(e) => setNewDeadline({ ...newDeadline, description: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24 resize-none"
                  placeholder="Enter deadline description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  value={newDeadline.dueDate}
                  onChange={(e) => setNewDeadline({ ...newDeadline, dueDate: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newDeadline.category}
                    onChange={(e) => setNewDeadline({ ...newDeadline, category: e.target.value as any })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newDeadline.priority}
                    onChange={(e) => setNewDeadline({ ...newDeadline, priority: e.target.value as any })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeadline}
                className="flex-1 btn-primary"
              >
                Create Deadline
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Deadlines List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-6"
      >
        {/* Overdue Deadlines */}
        {overdueDeadlines.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Overdue ({overdueDeadlines.length})
            </h2>
            <div className="space-y-3">
              {overdueDeadlines.map((deadline) => (
                <DeadlineCard
                  key={deadline.id}
                  deadline={deadline}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteDeadline}
                  getTimeUntilDeadline={getTimeUntilDeadline}
                  getPriorityColor={getPriorityColor}
                  getDeadlineUrgency={getDeadlineUrgency}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Upcoming ({upcomingDeadlines.length})
            </h2>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <DeadlineCard
                  key={deadline.id}
                  deadline={deadline}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteDeadline}
                  getTimeUntilDeadline={getTimeUntilDeadline}
                  getPriorityColor={getPriorityColor}
                  getDeadlineUrgency={getDeadlineUrgency}
                />
              ))}
            </div>
          </div>
        )}

        {filteredAndSortedDeadlines.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No deadlines found</h3>
            <p className="text-gray-600 mb-6">Create your first deadline to get started!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Add Your First Deadline
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const DeadlineCard: React.FC<{
  deadline: any;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  getTimeUntilDeadline: (date: Date) => string;
  getPriorityColor: (priority: string) => string;
  getDeadlineUrgency: (date: Date) => string;
}> = ({ deadline, onToggleComplete, onDelete, getTimeUntilDeadline, getPriorityColor, getDeadlineUrgency }) => {
  return (
    <div className={`p-6 rounded-lg border-l-4 ${getDeadlineUrgency(deadline.dueDate)} ${deadline.isCompleted ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className={`text-lg font-semibold ${deadline.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {deadline.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(deadline.priority)}`}>
              {deadline.priority}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
              {deadline.category}
            </span>
          </div>
          
          {deadline.description && (
            <p className={`text-gray-600 mb-3 ${deadline.isCompleted ? 'line-through' : ''}`}>
              {deadline.description}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Due: {format(deadline.dueDate, 'MMM dd, yyyy')}</span>
            <span className={deadline.isCompleted ? 'text-green-600' : ''}>
              {deadline.isCompleted ? 'Completed' : getTimeUntilDeadline(deadline.dueDate)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleComplete(deadline.id, !deadline.isCompleted)}
            className={`p-2 rounded-lg transition-colors ${
              deadline.isCompleted
                ? 'text-green-600 bg-green-100 hover:bg-green-200'
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onDelete(deadline.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Deadlines;