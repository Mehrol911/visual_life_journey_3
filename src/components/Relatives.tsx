import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfessionTheme } from '../types';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Gift, 
  Heart, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  Save, 
  X, 
  User, 
  Cake, 
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  Eye,
  UserPlus,
  Sparkles
} from 'lucide-react';

interface Relative {
  id: string;
  name: string;
  relationship: string;
  birthDate: string; // YYYY-MM-DD format
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  giftIdeas: string[];
  favoriteThings: string[];
  profileImage?: string;
  createdAt: string;
}

interface RelativesProps {
  theme: ProfessionTheme;
}

type ActiveView = 'overview' | 'add' | 'edit' | 'view' | 'birthdays';
type RelationshipFilter = 'all' | 'family' | 'friends' | 'colleagues';

const RELATIONSHIP_TYPES = [
  'Parent', 'Sibling', 'Child', 'Grandparent', 'Grandchild', 
  'Aunt/Uncle', 'Cousin', 'Spouse/Partner', 'Friend', 'Colleague', 'Other'
];

const RELATIONSHIP_CATEGORIES = {
  family: ['Parent', 'Sibling', 'Child', 'Grandparent', 'Grandchild', 'Aunt/Uncle', 'Cousin', 'Spouse/Partner'],
  friends: ['Friend'],
  colleagues: ['Colleague'],
  other: ['Other']
};

export const Relatives: React.FC<RelativesProps> = ({ theme }) => {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState<RelationshipFilter>('all');
  const [selectedRelative, setSelectedRelative] = useState<Relative | null>(null);
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    birthDate: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    giftIdeas: ['', '', ''],
    favoriteThings: ['', '', '']
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate upcoming birthdays
  const getUpcomingBirthdays = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return relatives
      .map(relative => {
        const birthDate = new Date(relative.birthDate);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        const nextYearBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
        
        // Determine which birthday to use
        const upcomingBirthday = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
        const daysUntil = Math.ceil((upcomingBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const age = upcomingBirthday.getFullYear() - birthDate.getFullYear();
        
        return {
          ...relative,
          upcomingBirthday,
          daysUntil,
          age,
          isUpcoming: daysUntil <= 30
        };
      })
      .filter(relative => relative.isUpcoming)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  };

  // Get next birthday
  const getNextBirthday = () => {
    const upcoming = getUpcomingBirthdays();
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  // Statistics
  const totalRelatives = relatives.length;
  const upcomingBirthdays = getUpcomingBirthdays();
  const thisMonthBirthdays = upcomingBirthdays.filter(r => r.daysUntil <= 31);
  const nextBirthday = getNextBirthday();

  // Filter relatives
  const filteredRelatives = relatives.filter(relative => {
    const matchesSearch = relative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relative.relationship.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (relationshipFilter !== 'all') {
      const categoryRelationships = RELATIONSHIP_CATEGORIES[relationshipFilter as keyof typeof RELATIONSHIP_CATEGORIES] || [];
      matchesFilter = categoryRelationships.includes(relative.relationship);
    }
    
    return matchesSearch && matchesFilter;
  });

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.relationship) {
      newErrors.relationship = 'Relationship is required';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthDate = 'Birth date cannot be in the future';
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRelative: Relative = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      relationship: formData.relationship,
      birthDate: formData.birthDate,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      address: formData.address.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      giftIdeas: formData.giftIdeas.filter(idea => idea.trim()),
      favoriteThings: formData.favoriteThings.filter(thing => thing.trim()),
      createdAt: new Date().toISOString()
    };

    setRelatives(prev => [...prev, newRelative]);

    // Reset form
    setFormData({
      name: '',
      relationship: '',
      birthDate: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      giftIdeas: ['', '', ''],
      favoriteThings: ['', '', '']
    });
    
    setErrors({});
    setIsSubmitting(false);
    setActiveView('overview');
  };

  const deleteRelative = (id: string) => {
    setRelatives(prev => prev.filter(r => r.id !== id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilBirthday = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    const nextYearBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    
    const upcomingBirthday = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
    const daysUntil = Math.ceil((upcomingBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntil;
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
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Relatives</p>
              <p className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
                {totalRelatives}
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: theme.gradients.primary }}
            >
              <Users className="w-6 h-6 text-white" />
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
              <p className="text-sm font-semibold text-gray-600 mb-1">Upcoming Birthdays</p>
              <p className="text-3xl font-bold" style={{ color: theme.colors.accent }}>
                {upcomingBirthdays.length}
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
                {thisMonthBirthdays.length}
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: theme.gradients.primary }}
            >
              <Cake className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
            borderColor: theme.colors.primary + '20'
          }}
          onClick={() => setActiveView('birthdays')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Next Birthday</p>
              <p className="text-lg font-bold" style={{ color: theme.colors.warning }}>
                {nextBirthday ? (
                  <>
                    {nextBirthday.daysUntil === 0 ? 'Today!' : 
                     nextBirthday.daysUntil === 1 ? 'Tomorrow' : 
                     `${nextBirthday.daysUntil} days`}
                  </>
                ) : (
                  'None soon'
                )}
              </p>
              {nextBirthday && (
                <p className="text-xs text-gray-500 mt-1">{nextBirthday.name}</p>
              )}
            </div>
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: theme.gradients.primary }}
            >
              <Sparkles className="w-6 h-6 text-white" />
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
            placeholder="Search relatives..."
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowRelationshipDropdown(!showRelationshipDropdown)}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 focus:outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: theme.colors.primary + '20'
              }}
            >
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 capitalize">
                {relationshipFilter === 'all' ? 'All Relationships' : relationshipFilter}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            <AnimatePresence>
              {showRelationshipDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 w-full mt-2 bg-white rounded-xl border shadow-lg"
                  style={{ borderColor: theme.colors.primary + '20' }}
                >
                  {[
                    { value: 'all', label: 'All Relationships' },
                    { value: 'family', label: 'Family' },
                    { value: 'friends', label: 'Friends' },
                    { value: 'colleagues', label: 'Colleagues' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setRelationshipFilter(option.value as RelationshipFilter);
                        setShowRelationshipDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveView('birthdays')}
            className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300"
            style={{ 
              background: theme.gradients.primary,
              boxShadow: `0 4px 20px ${theme.colors.primary}40`
            }}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Upcoming Birthdays
          </motion.button>

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
            Add Relative
          </motion.button>
        </div>
      </motion.div>

      {/* Relatives Grid */}
      <div className="max-h-[60vh] overflow-y-auto pr-4" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.colors.primary}40 transparent`
      }}>
        <style jsx>{`
          .max-h-\\[60vh\\]::-webkit-scrollbar {
            width: 8px;
          }
          .max-h-\\[60vh\\]::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1);
            border-radius: 4px;
          }
          .max-h-\\[60vh\\]::-webkit-scrollbar-thumb {
            background: ${theme.colors.primary}60;
            border-radius: 4px;
          }
          .max-h-\\[60vh\\]::-webkit-scrollbar-thumb:hover {
            background: ${theme.colors.primary}80;
          }
        `}</style>

        <AnimatePresence mode="wait">
          {filteredRelatives.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <Users className="w-24 h-24 mx-auto mb-6 text-gray-300" />
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                {relatives.length === 0 ? 'Build Your Family Network' : 'No Relatives Found'}
              </h3>
              <p className="text-gray-500 mb-8">
                {relatives.length === 0 
                  ? 'Start adding your loved ones to never miss important moments'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {relatives.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveView('add')}
                  className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
                  style={{ background: theme.gradients.primary }}
                >
                  <UserPlus className="w-5 h-5 inline mr-2" />
                  Add Your First Relative
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8"
            >
              {filteredRelatives.map((relative, index) => {
                const daysUntil = getDaysUntilBirthday(relative.birthDate);
                const isUpcoming = daysUntil <= 30;
                
                return (
                  <motion.div
                    key={relative.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer relative"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                      borderColor: isUpcoming ? theme.colors.warning + '40' : theme.colors.primary + '20'
                    }}
                    onClick={() => {
                      setSelectedRelative(relative);
                      setActiveView('view');
                    }}
                  >
                    {isUpcoming && (
                      <div 
                        className="absolute top-3 right-3 w-3 h-3 rounded-full animate-pulse"
                        style={{ backgroundColor: theme.colors.warning }}
                        title="Birthday coming up!"
                      />
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ background: theme.gradients.primary }}
                        >
                          {relative.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{relative.name}</h3>
                          <p className="text-sm text-gray-600">{relative.relationship}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRelative(relative.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-100 text-red-500 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Cake className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {formatDate(relative.birthDate)}
                          </span>
                        </div>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            daysUntil <= 7 ? 'text-red-600 bg-red-100' :
                            daysUntil <= 30 ? 'text-orange-600 bg-orange-100' :
                            'text-gray-600 bg-gray-100'
                          }`}
                        >
                          {daysUntil === 0 ? 'Today!' : 
                           daysUntil === 1 ? 'Tomorrow' : 
                           `${daysUntil} days`}
                        </span>
                      </div>

                      {relative.giftIdeas.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Gift Ideas
                          </h4>
                          <div className="space-y-1">
                            {relative.giftIdeas.slice(0, 2).map((idea, idx) => (
                              <p key={idx} className="text-sm text-gray-600 line-clamp-1">
                                • {idea}
                              </p>
                            ))}
                            {relative.giftIdeas.length > 2 && (
                              <p className="text-xs text-gray-400">+{relative.giftIdeas.length - 2} more</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRelative(relative);
                          setActiveView('view');
                        }}
                        className="flex items-center text-sm font-semibold transition-colors duration-200"
                        style={{ color: theme.colors.primary }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
          <h2 className="text-3xl font-bold text-gray-800">Add New Relative</h2>
          <p className="text-gray-600">Keep your loved ones close to your heart</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Information */}
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: errors.name ? '#ef4444' : theme.colors.primary + '20'
                  }}
                  placeholder="Enter their full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Relationship *
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, relationship: e.target.value }));
                    if (errors.relationship) setErrors(prev => ({ ...prev, relationship: '' }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: errors.relationship ? '#ef4444' : theme.colors.primary + '20'
                  }}
                >
                  <option value="">Select relationship</option>
                  {RELATIONSHIP_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.relationship && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.relationship}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Birth Date *
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, birthDate: e.target.value }));
                    if (errors.birthDate) setErrors(prev => ({ ...prev, birthDate: '' }));
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: errors.birthDate ? '#ef4444' : theme.colors.primary + '20'
                  }}
                />
                {errors.birthDate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.birthDate}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: errors.email ? '#ef4444' : theme.colors.primary + '20'
                  }}
                  placeholder="their.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: theme.colors.primary + '20'
                  }}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none h-20"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: theme.colors.primary + '20'
                  }}
                  placeholder="Their home address..."
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Gift Ideas */}
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gift Ideas</h3>
            
            <div className="space-y-3">
              {formData.giftIdeas.map((idea, index) => (
                <div key={index} className="relative">
                  <div 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: theme.colors.primary }}
                  >
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={idea}
                    onChange={(e) => {
                      const newGiftIdeas = [...formData.giftIdeas];
                      newGiftIdeas[index] = e.target.value;
                      setFormData(prev => ({ ...prev, giftIdeas: newGiftIdeas }));
                    }}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderColor: theme.colors.primary + '20'
                    }}
                    placeholder={`Gift idea ${index + 1}...`}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Favorite Things */}
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Favorite Things</h3>
            
            <div className="space-y-3">
              {formData.favoriteThings.map((thing, index) => (
                <div key={index} className="relative">
                  <div 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: theme.colors.accent }}
                  >
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={thing}
                    onChange={(e) => {
                      const newFavoriteThings = [...formData.favoriteThings];
                      newFavoriteThings[index] = e.target.value;
                      setFormData(prev => ({ ...prev, favoriteThings: newFavoriteThings }));
                    }}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderColor: theme.colors.primary + '20'
                    }}
                    placeholder={`Favorite thing ${index + 1}...`}
                  />
                </div>
              ))}
            </div>
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Notes</h3>
            
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none h-24"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: theme.colors.primary + '20'
              }}
              placeholder="Any special notes about this person..."
            />
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
                Adding Relative...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-3" />
                Add to Family
                <Heart className="w-5 h-5 ml-3" />
              </>
            )}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderBirthdays = () => (
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
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <Sparkles className="w-8 h-8 mr-3" style={{ color: theme.colors.primary }} />
            Upcoming Birthdays
          </h2>
          <p className="text-gray-600">Next 30 days • Plan ahead and show you care</p>
        </div>
      </div>

      {/* Birthdays List */}
      <div className="max-h-[70vh] overflow-y-auto pr-4" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.colors.primary}40 transparent`
      }}>
        <style jsx>{`
          .max-h-\\[70vh\\]::-webkit-scrollbar {
            width: 8px;
          }
          .max-h-\\[70vh\\]::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1);
            border-radius: 4px;
          }
          .max-h-\\[70vh\\]::-webkit-scrollbar-thumb {
            background: ${theme.colors.primary}60;
            border-radius: 4px;
          }
          .max-h-\\[70vh\\]::-webkit-scrollbar-thumb:hover {
            background: ${theme.colors.primary}80;
          }
        `}</style>

        <AnimatePresence mode="wait">
          {upcomingBirthdays.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <Calendar className="w-24 h-24 mx-auto mb-6 text-gray-300" />
              <h3 className="text-2xl font-bold text-gray-600 mb-4">No Upcoming Birthdays</h3>
              <p className="text-gray-500 mb-8">
                No birthdays in the next 30 days. Time to plan for future celebrations!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {upcomingBirthdays.map((relative, index) => (
                <motion.div
                  key={relative.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg hover:shadow-xl transition-all duration-300 group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                    borderColor: relative.daysUntil <= 7 ? theme.colors.error + '40' : 
                                relative.daysUntil <= 14 ? theme.colors.warning + '40' : 
                                theme.colors.primary + '20'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                        style={{ background: theme.gradients.primary }}
                      >
                        {relative.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{relative.name}</h3>
                        <p className="text-gray-600">{relative.relationship}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Cake className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Turning {relative.age}
                          </span>
                          <Clock className="w-4 h-4 text-gray-500 ml-2" />
                          <span 
                            className={`text-sm font-semibold ${
                              relative.daysUntil === 0 ? 'text-red-600' :
                              relative.daysUntil <= 7 ? 'text-orange-600' :
                              'text-blue-600'
                            }`}
                          >
                            {relative.daysUntil === 0 ? 'Today!' : 
                             relative.daysUntil === 1 ? 'Tomorrow' : 
                             `${relative.daysUntil} days`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div 
                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                          relative.daysUntil === 0 ? 'bg-red-100 text-red-600' :
                          relative.daysUntil <= 7 ? 'bg-orange-100 text-orange-600' :
                          'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {formatDate(relative.birthDate)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {relative.upcomingBirthday.toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>
                    </div>
                  </div>

                  {relative.giftIdeas.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Gift className="w-4 h-4 mr-2" />
                        Gift Ideas
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {relative.giftIdeas.slice(0, 3).map((idea, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: theme.colors.primary }}
                            >
                              {idx + 1}
                            </div>
                            <span className="text-sm text-gray-600">{idea}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedRelative(relative);
                        setActiveView('view');
                      }}
                      className="px-6 py-2 rounded-xl font-semibold text-white transition-all duration-300"
                      style={{ background: theme.gradients.primary }}
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      View Details
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const renderViewRelative = () => {
    if (!selectedRelative) return null;

    const daysUntil = getDaysUntilBirthday(selectedRelative.birthDate);
    const birthDate = new Date(selectedRelative.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();

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
            <div className="flex items-center space-x-4">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                style={{ background: theme.gradients.primary }}
              >
                {selectedRelative.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">{selectedRelative.name}</h2>
                <p className="text-xl text-gray-600">{selectedRelative.relationship}</p>
                <p className="text-sm text-gray-500">Age {age}</p>
              </div>
            </div>
          </div>
          
          <div 
            className={`px-6 py-3 rounded-full font-semibold ${
              daysUntil <= 7 ? 'bg-red-100 text-red-600' :
              daysUntil <= 30 ? 'bg-orange-100 text-orange-600' :
              'bg-gray-100 text-gray-600'
            }`}
          >
            Birthday: {daysUntil === 0 ? 'Today!' : 
                      daysUntil === 1 ? 'Tomorrow' : 
                      `${daysUntil} days`}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
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
              <User className="w-6 h-6 mr-3" style={{ color: theme.colors.primary }} />
              Contact Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Birthday</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedRelative.birthDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {selectedRelative.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a 
                      href={`mailto:${selectedRelative.email}`}
                      className="font-semibold hover:underline"
                      style={{ color: theme.colors.primary }}
                    >
                      {selectedRelative.email}
                    </a>
                  </div>
                </div>
              )}

              {selectedRelative.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a 
                      href={`tel:${selectedRelative.phone}`}
                      className="font-semibold hover:underline"
                      style={{ color: theme.colors.primary }}
                    >
                      {selectedRelative.phone}
                    </a>
                  </div>
                </div>
              )}

              {selectedRelative.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold text-gray-800">{selectedRelative.address}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Gift Ideas & Favorites */}
          <div className="space-y-6">
            {/* Gift Ideas */}
            {selectedRelative.giftIdeas.length > 0 && (
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
                  <Gift className="w-5 h-5 mr-2" style={{ color: theme.colors.primary }} />
                  Gift Ideas
                </h3>
                <div className="space-y-3">
                  {selectedRelative.giftIdeas.map((idea, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: theme.colors.primary }}
                      >
                        {idx + 1}
                      </div>
                      <p className="text-gray-700">{idea}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Favorite Things */}
            {selectedRelative.favoriteThings.length > 0 && (
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
                  <Heart className="w-5 h-5 mr-2" style={{ color: theme.colors.accent }} />
                  Favorite Things
                </h3>
                <div className="space-y-3">
                  {selectedRelative.favoriteThings.map((thing, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: theme.colors.accent }}
                      >
                        {idx + 1}
                      </div>
                      <p className="text-gray-700">{thing}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Notes */}
        {selectedRelative.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-8 rounded-3xl backdrop-blur-lg border"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Notes</h3>
            <p className="text-gray-700 leading-relaxed">{selectedRelative.notes}</p>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Background */}
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
              <Users className="w-8 h-8 mr-3" style={{ color: theme.colors.primary }} />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                My Relatives
              </h1>
              <Heart className="w-8 h-8 ml-3" style={{ color: theme.colors.accent }} />
            </div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Keep your loved ones close to your heart. Track birthdays, plan gifts, and nurture meaningful relationships
            </p>
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeView === 'overview' && renderOverview()}
          {activeView === 'add' && renderAddForm()}
          {activeView === 'birthdays' && renderBirthdays()}
          {activeView === 'view' && renderViewRelative()}
        </AnimatePresence>
      </div>
    </div>
  );
};