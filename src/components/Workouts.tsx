import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfessionTheme } from '../types';
import { 
  Dumbbell,
  Plus,
  Calendar,
  Clock,
  Trash2,
  Search,
  Filter,
  ArrowLeft,
  Save,
  TrendingUp,
  Target,
  Zap,
  Award,
  Activity,
  Timer,
  BarChart3,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Workout {
  id: string;
  date: string; // YYYY-MM-DD format
  activity: string;
  emoji: string;
  duration: number; // in minutes
  intensity: 'Low' | 'Medium' | 'High';
  notes?: string;
  calories?: number;
  createdAt: string;
}

interface WorkoutsProps {
  theme: ProfessionTheme;
  userBirthDate?: string; // For validation
}

type ActiveView = 'overview' | 'add' | 'view';

// Predefined activities with emojis
const ACTIVITIES = [
  { name: 'Walking', emoji: '🚶', category: 'Cardio' },
  { name: 'Running', emoji: '🏃', category: 'Cardio' },
  { name: 'Swimming', emoji: '🏊', category: 'Cardio' },
  { name: 'Cycling', emoji: '🚴', category: 'Cardio' },
  { name: 'Weight Training', emoji: '🏋️', category: 'Strength' },
  { name: 'Yoga', emoji: '🧘', category: 'Flexibility' },
  { name: 'Pilates', emoji: '🤸', category: 'Flexibility' },
  { name: 'Dancing', emoji: '💃', category: 'Cardio' },
  { name: 'Boxing', emoji: '🥊', category: 'Strength' },
  { name: 'Tennis', emoji: '🎾', category: 'Sports' },
  { name: 'Basketball', emoji: '🏀', category: 'Sports' },
  { name: 'Football', emoji: '⚽', category: 'Sports' },
  { name: 'Hiking', emoji: '🥾', category: 'Outdoor' },
  { name: 'Rock Climbing', emoji: '🧗', category: 'Outdoor' },
  { name: 'Skiing', emoji: '⛷️', category: 'Outdoor' },
  { name: 'Surfing', emoji: '🏄', category: 'Outdoor' },
  { name: 'Martial Arts', emoji: '🥋', category: 'Strength' },
  { name: 'Stretching', emoji: '🤲', category: 'Flexibility' },
  { name: 'CrossFit', emoji: '💪', category: 'Strength' },
  { name: 'Rowing', emoji: '🚣', category: 'Cardio' }
];

export const Workouts: React.FC<WorkoutsProps> = ({ 
  theme, 
  userBirthDate = '1990-01-01' 
}) => {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  
  // Form state for adding new workout
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    activity: '',
    emoji: '',
    duration: 30,
    intensity: 'Medium' as 'Low' | 'Medium' | 'High',
    notes: '',
    calories: 0
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showActivitySelector, setShowActivitySelector] = useState(false);

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

  // Calculate total workout time for a specific date
  const getTotalWorkoutTimeForDate = (date: string, excludeId?: string): number => {
    return workouts
      .filter(w => w.date === date && w.id !== excludeId)
      .reduce((total, w) => total + w.duration, 0);
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
    }

    // Activity validation
    if (!formData.activity) {
      newErrors.activity = 'Activity is required';
    }

    // Duration validation
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    } else if (formData.duration > 1440) { // 24 hours = 1440 minutes
      newErrors.duration = 'Duration cannot exceed 24 hours (1440 minutes)';
    } else {
      // Check if total workout time for the day would exceed 24 hours
      const existingTime = getTotalWorkoutTimeForDate(formData.date);
      const totalTime = existingTime + formData.duration;
      
      if (totalTime > 1440) {
        const availableTime = 1440 - existingTime;
        newErrors.duration = `Total workout time for this day would exceed 24 hours. You can add maximum ${availableTime} minutes more.`;
      }
    }

    // Calories validation (optional but if provided should be reasonable)
    if (formData.calories && (formData.calories < 0 || formData.calories > 2000)) {
      newErrors.calories = 'Calories should be between 0 and 2000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newWorkout: Workout = {
      id: Date.now().toString(),
      date: formData.date,
      activity: formData.activity,
      emoji: formData.emoji,
      duration: formData.duration,
      intensity: formData.intensity,
      notes: formData.notes.trim() || undefined,
      calories: formData.calories || undefined,
      createdAt: new Date().toISOString()
    };

    setWorkouts(prev => [newWorkout, ...prev].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      activity: '',
      emoji: '',
      duration: 30,
      intensity: 'Medium',
      notes: '',
      calories: 0
    });
    
    setErrors({});
    setIsSubmitting(false);
    setActiveView('overview');
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const selectActivity = (activity: typeof ACTIVITIES[0]) => {
    setFormData(prev => ({
      ...prev,
      activity: activity.name,
      emoji: activity.emoji
    }));
    setShowActivitySelector(false);
    if (errors.activity) {
      setErrors(prev => ({ ...prev, activity: '' }));
    }
  };

  // Filter workouts
  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDate || workout.date === selectedDate;
    const matchesActivity = !selectedActivity || workout.activity === selectedActivity;
    return matchesSearch && matchesDate && matchesActivity;
  });

  // Pagination
  const totalPages = Math.ceil(filteredWorkouts.length / itemsPerPage);
  const paginatedWorkouts = filteredWorkouts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const averageDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;
  const thisWeekWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return workoutDate >= weekAgo && workoutDate <= today;
  }).length;

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'Low': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'High': return '#ef4444';
      default: return theme.colors.primary;
    }
  };

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Workouts</p>
              <p className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
                {totalWorkouts}
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: theme.gradients.primary }}
            >
              <Dumbbell className="w-6 h-6 text-white" />
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
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Hours</p>
              <p className="text-3xl font-bold" style={{ color: theme.colors.accent }}>
                {totalHours}h
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: theme.gradients.primary }}
            >
              <Clock className="w-6 h-6 text-white" />
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
              <p className="text-sm font-semibold text-gray-600 mb-1">Avg Duration</p>
              <p className="text-3xl font-bold" style={{ color: theme.colors.success }}>
                {averageDuration}m
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
          transition={{ delay: 0.4 }}
          className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
            borderColor: theme.colors.primary + '20'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">This Week</p>
              <p className="text-3xl font-bold" style={{ color: theme.colors.warning }}>
                {thisWeekWorkouts}
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: theme.gradients.primary }}
            >
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col lg:flex-row gap-4 mb-6"
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
            placeholder="Search workouts..."
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
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 focus:outline-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <option value="">All Activities</option>
            {ACTIVITIES.map(activity => (
              <option key={activity.name} value={activity.name}>
                {activity.emoji} {activity.name}
              </option>
            ))}
          </select>
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
          New Workout
        </motion.button>
      </motion.div>

      {/* Workouts Grid */}
      <AnimatePresence mode="wait">
        {paginatedWorkouts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-20"
          >
            <Dumbbell className="w-24 h-24 mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              {workouts.length === 0 ? 'Start Your Fitness Journey' : 'No Workouts Found'}
            </h3>
            <p className="text-gray-500 mb-8">
              {workouts.length === 0 
                ? 'Begin tracking your workouts and build healthy habits'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {workouts.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView('add')}
                className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
                style={{ background: theme.gradients.primary }}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Log Your First Workout
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
            {paginatedWorkouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                  borderColor: theme.colors.primary + '20'
                }}
                onClick={() => {
                  setSelectedWorkout(workout);
                  setActiveView('view');
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{workout.emoji}</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{workout.activity}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(workout.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWorkout(workout.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-100 text-red-500 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        {Math.floor(workout.duration / 60)}h {workout.duration % 60}m
                      </span>
                    </div>
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: getIntensityColor(workout.intensity) }}
                    >
                      {workout.intensity}
                    </div>
                  </div>

                  {workout.calories && (
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{workout.calories} calories</span>
                    </div>
                  )}

                  {workout.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 line-clamp-2 italic">
                        "{workout.notes}"
                      </p>
                    </div>
                  )}
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
            <ArrowLeft className="w-5 h-5" />
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
            <ArrowLeft className="w-5 h-5 rotate-180" />
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
          <h2 className="text-3xl font-bold text-gray-800">Log New Workout</h2>
          <p className="text-gray-600">Track your fitness activities and progress</p>
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
              Workout Date
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
                className="text-red-500 text-sm mt-2 flex items-center"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.date}
              </motion.p>
            )}
            
            {/* Show total workout time for selected date */}
            {formData.date && (
              <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-700">
                  <Timer className="w-4 h-4 inline mr-1" />
                  Total workout time for this date: {getTotalWorkoutTimeForDate(formData.date)} minutes
                </p>
              </div>
            )}
          </motion.div>

          {/* Activity Selection */}
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
              <Activity className="w-5 h-5 inline mr-2" />
              Activity Type
            </label>
            
            <button
              type="button"
              onClick={() => setShowActivitySelector(true)}
              className="w-full p-4 rounded-xl border-2 transition-all duration-300 focus:outline-none text-left flex items-center justify-between"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: errors.activity ? '#ef4444' : theme.colors.primary + '20'
              }}
            >
              <div className="flex items-center space-x-3">
                {formData.emoji && <span className="text-2xl">{formData.emoji}</span>}
                <span className={formData.activity ? 'text-gray-800' : 'text-gray-500'}>
                  {formData.activity || 'Select an activity'}
                </span>
              </div>
              <Plus className="w-5 h-5 text-gray-400" />
            </button>
            
            {errors.activity && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2 flex items-center"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.activity}
              </motion.p>
            )}
          </motion.div>

          {/* Duration and Intensity */}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  <Clock className="w-5 h-5 inline mr-2" />
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }));
                    if (errors.duration) {
                      setErrors(prev => ({ ...prev, duration: '' }));
                    }
                  }}
                  min="1"
                  max="1440"
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: errors.duration ? '#ef4444' : theme.colors.primary + '20'
                  }}
                />
                {errors.duration && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 flex items-start"
                  >
                    <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{errors.duration}</span>
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  <Target className="w-5 h-5 inline mr-2" />
                  Intensity
                </label>
                <select
                  value={formData.intensity}
                  onChange={(e) => setFormData(prev => ({ ...prev, intensity: e.target.value as 'Low' | 'Medium' | 'High' }))}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: theme.colors.primary + '20'
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Calories (Optional) */}
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
              <Zap className="w-5 h-5 inline mr-2" />
              Calories Burned (Optional)
            </label>
            <input
              type="number"
              value={formData.calories}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }));
                if (errors.calories) {
                  setErrors(prev => ({ ...prev, calories: '' }));
                }
              }}
              min="0"
              max="2000"
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: errors.calories ? '#ef4444' : theme.colors.primary + '20'
              }}
              placeholder="Estimated calories burned"
            />
            {errors.calories && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2 flex items-center"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.calories}
              </motion.p>
            )}
          </motion.div>

          {/* Notes */}
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
              <Award className="w-5 h-5 inline mr-2" />
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="How did it feel? Any achievements or observations..."
              className="w-full h-32 p-4 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: theme.colors.primary + '20'
              }}
            />
            <p className="text-sm text-gray-500 mt-2">
              {formData.notes.length}/200 characters
            </p>
          </motion.div>

          {/* Workout Summary */}
          {formData.activity && formData.duration > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-3xl border"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}10 0%, ${theme.colors.accent}10 100%)`,
                borderColor: theme.colors.primary + '30'
              }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" style={{ color: theme.colors.success }} />
                Workout Summary
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{formData.emoji}</span>
                  <span className="font-semibold text-gray-800">{formData.activity}</span>
                </div>
                <p className="text-gray-600">
                  Duration: {Math.floor(formData.duration / 60)}h {formData.duration % 60}m
                </p>
                <p className="text-gray-600">Intensity: {formData.intensity}</p>
                {formData.calories > 0 && (
                  <p className="text-gray-600">Calories: {formData.calories}</p>
                )}
              </div>
            </motion.div>
          )}
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
          disabled={isSubmitting || !formData.activity || !formData.duration}
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
                Saving Workout...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-3" />
                Save Workout
                <Dumbbell className="w-5 h-5 ml-3" />
              </>
            )}
          </span>
        </motion.button>
      </motion.div>

      {/* Activity Selector Modal */}
      <AnimatePresence>
        {showActivitySelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowActivitySelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                borderColor: theme.colors.primary + '20',
                boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 20px ${theme.colors.primary}10`
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Choose Activity</h3>
                <button
                  onClick={() => setShowActivitySelector(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ACTIVITIES.map((activity) => (
                  <motion.button
                    key={activity.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectActivity(activity)}
                    className="p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderColor: theme.colors.primary + '20'
                    }}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{activity.emoji}</div>
                      <div className="text-sm font-semibold text-gray-800">{activity.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{activity.category}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderViewWorkout = () => {
    if (!selectedWorkout) return null;

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
              <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                <span className="text-4xl mr-3">{selectedWorkout.emoji}</span>
                {selectedWorkout.activity}
              </h2>
              <p className="text-gray-600">
                {new Date(selectedWorkout.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div 
            className="px-4 py-2 rounded-full text-white font-semibold"
            style={{ backgroundColor: getIntensityColor(selectedWorkout.intensity) }}
          >
            {selectedWorkout.intensity} Intensity
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Workout Details */}
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
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3" style={{ color: theme.colors.primary }} />
              Workout Details
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold text-gray-700">Duration</span>
                </div>
                <span className="text-xl font-bold" style={{ color: theme.colors.primary }}>
                  {Math.floor(selectedWorkout.duration / 60)}h {selectedWorkout.duration % 60}m
                </span>
              </div>

              {selectedWorkout.calories && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-gray-700">Calories Burned</span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: theme.colors.accent }}>
                    {selectedWorkout.calories}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold text-gray-700">Intensity</span>
                </div>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: getIntensityColor(selectedWorkout.intensity) }}
                >
                  {selectedWorkout.intensity}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl backdrop-blur-lg border"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Award className="w-6 h-6 mr-3" style={{ color: theme.colors.accent }} />
              Workout Notes
            </h3>
            
            {selectedWorkout.notes ? (
              <div className="p-6 rounded-xl bg-gray-50">
                <p className="text-gray-700 leading-relaxed italic">
                  "{selectedWorkout.notes}"
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-gray-50 text-center">
                <p className="text-gray-500">No notes recorded for this workout</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Logged on {new Date(selectedWorkout.createdAt).toLocaleDateString()} at{' '}
                {new Date(selectedWorkout.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
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
              <Dumbbell className="w-8 h-8 mr-3" style={{ color: theme.colors.primary }} />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Fitness Tracker
              </h1>
              <Zap className="w-8 h-8 ml-3" style={{ color: theme.colors.accent }} />
            </div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Track your workouts, monitor your progress, and build healthy habits that last a lifetime
            </p>
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeView === 'overview' && renderOverview()}
          {activeView === 'add' && renderAddForm()}
          {activeView === 'view' && renderViewWorkout()}
        </AnimatePresence>
      </div>
    </div>
  );
};