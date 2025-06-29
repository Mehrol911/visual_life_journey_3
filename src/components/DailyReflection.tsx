import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfessionTheme } from '../types';
import { 
  Heart, 
  Target, 
  BookOpen, 
  Smile, 
  Sparkles, 
  Save, 
  Calendar,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  ArrowLeft,
  Clock,
  TrendingUp,
  BarChart3,
  Lightbulb
} from 'lucide-react';

interface DailyReflection {
  id: string;
  date: string; // YYYY-MM-DD format
  reflection: string;
  mood: number; // 1-10
  gratitude: string[];
  goals: string[];
  createdAt: string;
}

interface DailyReflectionProps {
  theme: ProfessionTheme;
  userBirthDate?: string; // For validation
}

type ActiveView = 'overview' | 'add' | 'view';

export const DailyReflection: React.FC<DailyReflectionProps> = ({ 
  theme, 
  userBirthDate = '1990-01-01' // Default fallback
}) => {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReflection, setSelectedReflection] = useState<DailyReflection | null>(null);
  
  // Form state for adding new reflection
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reflection: '',
    mood: 5,
    gratitude: ['', '', ''],
    goals: ['', '', '']
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moodEmojis = ['😞', '😔', '😐', '🙂', '😊', '😁', '🤩', '🥳', '😍', '🤩'];
  const moodLabels = ['Terrible', 'Bad', 'Poor', 'Okay', 'Good', 'Great', 'Amazing', 'Fantastic', 'Incredible', 'Perfect'];
  
  const itemsPerPage = 6;

  // Date validation
  const validateDate = (date: string): boolean => {
    const selectedDate = new Date(date);
    const today = new Date();
    const birthDate = new Date(userBirthDate);
    
    // Reset time to compare dates only
    today.setHours(23, 59, 59, 999);
    selectedDate.setHours(0, 0, 0, 0);
    birthDate.setHours(0, 0, 0, 0);
    
    return selectedDate >= birthDate && selectedDate <= today;
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (!validateDate(formData.date)) {
      const birthDate = new Date(userBirthDate);
      const today = new Date();
      newErrors.date = `Date must be between ${birthDate.toLocaleDateString()} and ${today.toLocaleDateString()}`;
    } else {
      // Check if reflection already exists for this date
      const existingReflection = reflections.find(r => r.date === formData.date);
      if (existingReflection) {
        newErrors.date = 'You already have a reflection for this date';
      }
    }

    // Reflection validation
    if (!formData.reflection.trim()) {
      newErrors.reflection = 'Reflection is required';
    } else if (formData.reflection.trim().length < 10) {
      newErrors.reflection = 'Reflection should be at least 10 characters long';
    }

    // Gratitude validation
    if (formData.gratitude.some(item => !item.trim())) {
      newErrors.gratitude = 'All three gratitude items are required';
    }

    // Goals validation
    if (formData.goals.some(goal => !goal.trim())) {
      newErrors.goals = 'All three goals are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newReflection: DailyReflection = {
      id: Date.now().toString(),
      date: formData.date,
      reflection: formData.reflection.trim(),
      mood: formData.mood,
      gratitude: formData.gratitude.map(item => item.trim()),
      goals: formData.goals.map(goal => goal.trim()),
      createdAt: new Date().toISOString()
    };

    setReflections(prev => [newReflection, ...prev].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      reflection: '',
      mood: 5,
      gratitude: ['', '', ''],
      goals: ['', '', '']
    });
    
    setErrors({});
    setIsSubmitting(false);
    setActiveView('overview');
  };

  const deleteReflection = (id: string) => {
    setReflections(prev => prev.filter(r => r.id !== id));
  };

  // Filter reflections
  const filteredReflections = reflections.filter(reflection => {
    const matchesSearch = reflection.reflection.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reflection.gratitude.some(g => g.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         reflection.goals.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDate = !selectedDate || reflection.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReflections.length / itemsPerPage);
  const paginatedReflections = filteredReflections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const averageMood = reflections.length > 0 
    ? reflections.reduce((sum, r) => sum + r.mood, 0) / reflections.length 
    : 0;

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
            borderColor: theme.colors.primary + '20'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Reflections</p>
              <p className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
                {reflections.length}
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: theme.gradients.primary }}
            >
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
            borderColor: theme.colors.primary + '20'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Average Mood</p>
              <p className="text-3xl font-bold" style={{ color: theme.colors.accent }}>
                {averageMood.toFixed(1)}/10
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: theme.gradients.primary }}
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
            borderColor: theme.colors.primary + '20'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">This Month</p>
              <p className="text-3xl font-bold" style={{ color: theme.colors.success }}>
                {reflections.filter(r => {
                  const reflectionDate = new Date(r.date);
                  const now = new Date();
                  return reflectionDate.getMonth() === now.getMonth() && 
                         reflectionDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: theme.gradients.primary }}
            >
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 focus:outline-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderColor: theme.colors.primary + '20'
            }}
            placeholder="Search your reflections..."
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 focus:outline-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderColor: theme.colors.primary + '20'
            }}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveView('add')}
          className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300"
          style={{ 
            background: theme.gradients.primary,
            boxShadow: `0 4px 20px ${theme.colors.primary}40`
          }}
        >
          <Plus className="w-5 h-5 inline mr-2" />
          New Reflection
        </motion.button>
      </motion.div>

      {/* Reflections Grid */}
      <AnimatePresence mode="wait">
        {paginatedReflections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-20"
          >
            <BookOpen className="w-24 h-24 mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              {reflections.length === 0 ? 'Start Your Reflection Journey' : 'No Reflections Found'}
            </h3>
            <p className="text-gray-500 mb-8">
              {reflections.length === 0 
                ? 'Begin documenting your daily thoughts and experiences'
                : 'Try adjusting your search or date filter'
              }
            </p>
            {reflections.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView('add')}
                className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
                style={{ background: theme.gradients.primary }}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Write Your First Reflection
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paginatedReflections.map((reflection, index) => (
              <motion.div
                key={reflection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                  borderColor: theme.colors.primary + '20'
                }}
                onClick={() => {
                  setSelectedReflection(reflection);
                  setActiveView('view');
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-600">
                        {new Date(reflection.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{moodEmojis[reflection.mood - 1]}</span>
                        <span className="text-sm font-bold" style={{ color: theme.colors.primary }}>
                          {reflection.mood}/10
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 line-clamp-3 mb-4 leading-relaxed">
                      {reflection.reflection}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Gratitude
                    </h4>
                    <div className="space-y-1">
                      {reflection.gratitude.slice(0, 2).map((item, idx) => (
                        <p key={idx} className="text-sm text-gray-600 line-clamp-1">
                          • {item}
                        </p>
                      ))}
                      {reflection.gratitude.length > 2 && (
                        <p className="text-xs text-gray-400">+{reflection.gratitude.length - 2} more</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReflection(reflection);
                      setActiveView('view');
                    }}
                    className="flex items-center text-sm font-semibold transition-colors duration-200"
                    style={{ color: theme.colors.primary }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Full
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteReflection(reflection.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-100 text-red-500 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center items-center space-x-4 mt-8"
        >
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-semibold text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );

  const renderAddForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center mb-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveView('overview')}
          className="p-3 rounded-xl border mr-4 transition-all duration-300"
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderColor: theme.colors.primary + '20'
          }}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">New Daily Reflection</h2>
          <p className="text-gray-600">Capture your thoughts and experiences</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Date Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl backdrop-blur-lg border"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              <Calendar className="w-5 h-5 inline mr-2" />
              Reflection Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, date: e.target.value }));
                if (errors.date) {
                  setErrors(prev => ({ ...prev, date: '' }));
                }
              }}
              min={userBirthDate}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: errors.date ? '#ef4444' : theme.colors.primary + '20'
              }}
            />
            {errors.date && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2"
              >
                {errors.date}
              </motion.p>
            )}
          </motion.div>

          {/* Daily Reflection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl backdrop-blur-lg border"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              <BookOpen className="w-5 h-5 inline mr-2" />
              How was your day?
            </label>
            <textarea
              value={formData.reflection}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, reflection: e.target.value }));
                if (errors.reflection) {
                  setErrors(prev => ({ ...prev, reflection: '' }));
                }
              }}
              placeholder="Share your experiences, learnings, challenges, and moments of joy..."
              className="w-full h-40 p-4 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: errors.reflection ? '#ef4444' : theme.colors.primary + '20'
              }}
            />
            {errors.reflection && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2"
              >
                {errors.reflection}
              </motion.p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {formData.reflection.length}/500 characters
            </p>
          </motion.div>

          {/* Mood Tracker */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-3xl backdrop-blur-lg border"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              <Smile className="w-5 h-5 inline mr-2" />
              How are you feeling?
            </label>
            
            <div className="grid grid-cols-5 gap-2 mb-4">
              {moodEmojis.map((emoji, index) => (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mood: index + 1 }))}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`
                    aspect-square rounded-xl text-2xl transition-all duration-300 relative
                    ${formData.mood === index + 1 ? 'scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}
                  `}
                  style={{ 
                    background: formData.mood === index + 1 
                      ? theme.gradients.primary 
                      : 'rgba(255,255,255,0.8)',
                    border: formData.mood === index + 1 ? 'none' : `2px solid ${theme.colors.primary}20`
                  }}
                >
                  {formData.mood === index + 1 && (
                    <div 
                      className="absolute inset-0 rounded-xl"
                      style={{
                        boxShadow: `0 0 20px ${theme.colors.primary}60`
                      }}
                    />
                  )}
                  <span className="relative z-10">{emoji}</span>
                </motion.button>
              ))}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: theme.colors.primary }}>
                {formData.mood}/10
              </div>
              <div className="text-gray-600">
                {moodLabels[formData.mood - 1]}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Gratitude */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-3xl backdrop-blur-lg border"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              <Heart className="w-5 h-5 inline mr-2" />
              Three things I'm grateful for
            </label>
            <div className="space-y-3">
              {formData.gratitude.map((item, index) => (
                <div key={index} className="relative">
                  <div 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: theme.colors.primary }}
                  >
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newGratitude = [...formData.gratitude];
                      newGratitude[index] = e.target.value;
                      setFormData(prev => ({ ...prev, gratitude: newGratitude }));
                      if (errors.gratitude) {
                        setErrors(prev => ({ ...prev, gratitude: '' }));
                      }
                    }}
                    placeholder={`Something you're grateful for...`}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderColor: errors.gratitude ? '#ef4444' : theme.colors.primary + '20'
                    }}
                  />
                </div>
              ))}
            </div>
            {errors.gratitude && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2"
              >
                {errors.gratitude}
              </motion.p>
            )}
          </motion.div>

          {/* Goals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-3xl backdrop-blur-lg border"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              <Target className="w-5 h-5 inline mr-2" />
              Today's accomplishments/goals
            </label>
            <div className="space-y-3">
              {formData.goals.map((goal, index) => (
                <div key={index} className="relative">
                  <div 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: theme.colors.accent }}
                  >
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => {
                      const newGoals = [...formData.goals];
                      newGoals[index] = e.target.value;
                      setFormData(prev => ({ ...prev, goals: newGoals }));
                      if (errors.goals) {
                        setErrors(prev => ({ ...prev, goals: '' }));
                      }
                    }}
                    placeholder={`An accomplishment or goal...`}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderColor: errors.goals ? '#ef4444' : theme.colors.primary + '20'
                    }}
                  />
                </div>
              ))}
            </div>
            {errors.goals && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2"
              >
                {errors.goals}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center"
      >
        <motion.button
          whileHover={{ 
            scale: 1.05,
            boxShadow: `0 0 30px ${theme.colors.primary}50`
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-12 py-4 rounded-full text-white font-semibold text-lg relative overflow-hidden group shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            background: theme.gradients.primary,
            boxShadow: `0 4px 20px ${theme.colors.primary}40`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center">
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                Saving Reflection...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-3" />
                Save Today's Reflection
                <Sparkles className="w-5 h-5 ml-3" />
              </>
            )}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderViewReflection = () => {
    if (!selectedReflection) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveView('overview')}
              className="p-3 rounded-xl border mr-4 transition-all duration-300"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: theme.colors.primary + '20'
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {new Date(selectedReflection.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              <p className="text-gray-600 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Created {new Date(selectedReflection.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">{moodEmojis[selectedReflection.mood - 1]}</span>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
                  {selectedReflection.mood}/10
                </div>
                <div className="text-sm text-gray-600">
                  {moodLabels[selectedReflection.mood - 1]}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Reflection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-3xl backdrop-blur-lg border"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <BookOpen className="w-6 h-6 mr-3" style={{ color: theme.colors.primary }} />
              Daily Reflection
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedReflection.reflection}
            </p>
          </motion.div>

          {/* Gratitude & Goals */}
          <div className="space-y-6">
            {/* Gratitude */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-3xl backdrop-blur-lg border"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                borderColor: theme.colors.primary + '20'
              }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2" style={{ color: theme.colors.primary }} />
                Gratitude
              </h3>
              <div className="space-y-3">
                {selectedReflection.gratitude.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white mt-0.5 flex-shrink-0"
                      style={{ background: theme.colors.primary }}
                    >
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Goals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-3xl backdrop-blur-lg border"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                borderColor: theme.colors.primary + '20'
              }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" style={{ color: theme.colors.accent }} />
                Accomplishments & Goals
              </h3>
              <div className="space-y-3">
                {selectedReflection.goals.map((goal, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white mt-0.5 flex-shrink-0"
                      style={{ background: theme.colors.accent }}
                    >
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{goal}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)`
          }}
        />
        
        {/* Subtle accent elements */}
        <div 
          className="absolute top-20 right-20 w-32 h-32 rounded-full blur-2xl opacity-15"
          style={{
            background: `radial-gradient(circle, ${theme.colors.primary}60 0%, transparent 70%)`
          }}
        />
        <div 
          className="absolute bottom-32 left-32 w-24 h-24 rounded-full blur-xl opacity-10"
          style={{
            background: `radial-gradient(circle, ${theme.colors.accent}50 0%, transparent 70%)`
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header - Only show on overview */}
        {activeView === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-yellow-400 mr-3" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Daily Reflections
              </h1>
              <BookOpen className="w-8 h-8 ml-3" style={{ color: theme.colors.primary }} />
            </div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Document your journey, track your growth, and celebrate your progress through daily reflection
            </p>
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeView === 'overview' && renderOverview()}
          {activeView === 'add' && renderAddForm()}
          {activeView === 'view' && renderViewReflection()}
        </AnimatePresence>
      </div>
    </div>
  );
};