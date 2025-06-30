import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfessionTheme } from '../types';
import { 
  Users, 
  Plus, 
  Calendar, 
  Gift, 
  Search, 
  Filter, 
  ArrowLeft, 
  Save, 
  Heart, 
  Phone, 
  Mail, 
  MapPin, 
  Cake, 
  X, 
  Edit3, 
  Trash2, 
  Camera, 
  Upload, 
  User, 
  ChevronDown, 
  Eye, 
  AlertCircle,
  Clock,
  Star,
  Sparkles
} from 'lucide-react';

interface Relative {
  id: string;
  name: string;
  relationship: string;
  birthDate: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  giftIdeas: string[];
  profilePicture?: string;
  createdAt: string;
}

interface RelativesProps {
  theme: ProfessionTheme;
}

type ActiveView = 'overview' | 'add' | 'view' | 'birthdays';

// Comprehensive relationship types organized by category
const RELATIONSHIP_CATEGORIES = {
  'Family': [
    'Parent', 'Sibling', 'Child', 'Grandparent', 'Grandchild', 
    'Aunt/Uncle', 'Cousin', 'Spouse/Partner', 'In-Law', 'Step-Family'
  ],
  'Friends': [
    'Best Friend', 'Close Friend', 'Friend', 'Childhood Friend', 
    'School Friend', 'Neighbor', 'Roommate'
  ],
  'Professional': [
    'Colleague', 'Boss', 'Employee', 'Business Partner', 'Mentor', 
    'Client', 'Contractor', 'Consultant'
  ],
  'Social': [
    'Acquaintance', 'Club Member', 'Teammate', 'Classmate', 
    'Community Member', 'Volunteer Partner'
  ],
  'Other': [
    'Other'
  ]
};

// Flatten all relationships for easy access
const ALL_RELATIONSHIPS = Object.values(RELATIONSHIP_CATEGORIES).flat();

// Filter options for the main page
const FILTER_OPTIONS = [
  'All Relationships',
  ...Object.keys(RELATIONSHIP_CATEGORIES)
];

export const Relatives: React.FC<RelativesProps> = ({ theme }) => {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Relationships');
  const [selectedRelative, setSelectedRelative] = useState<Relative | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    giftIdeas: ['', '', ''],
    profilePicture: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate upcoming birthdays
  const getUpcomingBirthdays = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return relatives.filter(relative => {
      if (!relative.birthDate) return false;
      
      const birthDate = new Date(relative.birthDate);
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      // If birthday already passed this year, check next year
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }
      
      return thisYearBirthday <= thirtyDaysFromNow;
    }).sort((a, b) => {
      const dateA = new Date(a.birthDate);
      const dateB = new Date(b.birthDate);
      const thisYear = today.getFullYear();
      
      const birthdayA = new Date(thisYear, dateA.getMonth(), dateA.getDate());
      const birthdayB = new Date(thisYear, dateB.getMonth(), dateB.getDate());
      
      if (birthdayA < today) birthdayA.setFullYear(thisYear + 1);
      if (birthdayB < today) birthdayB.setFullYear(thisYear + 1);
      
      return birthdayA.getTime() - birthdayB.getTime();
    });
  };

  // Get next birthday
  const getNextBirthday = () => {
    const upcoming = getUpcomingBirthdays();
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  // Calculate days until birthday
  const getDaysUntilBirthday = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = thisYearBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate age
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Handle profile picture upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePicture: 'Please select a valid image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePicture: 'Image size must be less than 5MB' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setFormData(prev => ({ ...prev, profilePicture: imageUrl }));
        setErrors(prev => ({ ...prev, profilePicture: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
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
      
      if (birthDate.getFullYear() < 1900) {
        newErrors.birthDate = 'Please enter a valid birth date';
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save relative
  const saveRelative = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRelative: Relative = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      relationship: formData.relationship,
      birthDate: formData.birthDate,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      giftIdeas: formData.giftIdeas.filter(idea => idea.trim()).map(idea => idea.trim()),
      profilePicture: formData.profilePicture || undefined,
      createdAt: new Date().toISOString()
    };

    setRelatives(prev => [...prev, newRelative]);

    // Reset form
    setFormData({
      name: '',
      relationship: '',
      birthDate: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      giftIdeas: ['', '', ''],
      profilePicture: ''
    });
    
    setErrors({});
    setIsSubmitting(false);
    setActiveView('overview');
  };

  // Delete relative
  const deleteRelative = (id: string) => {
    setRelatives(prev => prev.filter(r => r.id !== id));
  };

  // Filter relatives
  const filteredRelatives = relatives.filter(relative => {
    const matchesSearch = relative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relative.relationship.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter !== 'All Relationships') {
      if (RELATIONSHIP_CATEGORIES[selectedFilter as keyof typeof RELATIONSHIP_CATEGORIES]) {
        matchesFilter = RELATIONSHIP_CATEGORIES[selectedFilter as keyof typeof RELATIONSHIP_CATEGORIES].includes(relative.relationship);
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  // Statistics
  const upcomingBirthdays = getUpcomingBirthdays();
  const nextBirthday = getNextBirthday();
  const thisMonthBirthdays = relatives.filter(relative => {
    if (!relative.birthDate) return false;
    const birthDate = new Date(relative.birthDate);
    const today = new Date();
    return birthDate.getMonth() === today.getMonth();
  });

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
                {relatives.length}
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
            background: nextBirthday 
              ? `linear-gradient(135deg, ${theme.colors.warning}15 0%, ${theme.colors.accent}15 100%)`
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
            borderColor: nextBirthday ? theme.colors.warning + '40' : theme.colors.primary + '20'
          }}
          onClick={() => nextBirthday && setActiveView('birthdays')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Next Birthday</p>
              {nextBirthday ? (
                <div>
                  <p className="text-lg font-bold text-gray-800 mb-1">{nextBirthday.name}</p>
                  <p className="text-sm" style={{ color: theme.colors.warning }}>
                    {getDaysUntilBirthday(nextBirthday.birthDate)} days
                  </p>
                </div>
              ) : (
                <p className="text-lg font-bold text-gray-500">None soon</p>
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
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center px-4 py-3 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 focus:outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: theme.colors.primary + '20'
              }}
            >
              <Filter className="w-5 h-5 mr-2 text-gray-500" />
              <span className="text-gray-700">{selectedFilter}</span>
              <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
            </button>
            
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 w-full mt-2 bg-white rounded-xl border shadow-lg max-h-60 overflow-y-auto"
                  style={{ borderColor: theme.colors.primary + '20' }}
                >
                  {FILTER_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedFilter(option);
                        setShowFilterDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 text-gray-800"
                    >
                      {option}
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
      <div className="max-h-[60vh] overflow-y-auto pr-2" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.colors.primary}40 transparent`
      }}>
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 8px;
          }
          div::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1);
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb {
            background: ${theme.colors.primary}60;
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb:hover {
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
                  <Plus className="w-5 h-5 inline mr-2" />
                  Add Your First Relative
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6"
            >
              {filteredRelatives.map((relative, index) => (
                <motion.div
                  key={relative.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                    borderColor: theme.colors.primary + '20'
                  }}
                  onClick={() => {
                    setSelectedRelative(relative);
                    setActiveView('view');
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {relative.profilePicture ? (
                        <img
                          src={relative.profilePicture}
                          alt={relative.name}
                          className="w-16 h-16 rounded-full object-cover border-4 shadow-lg"
                          style={{ borderColor: theme.colors.primary }}
                        />
                      ) : (
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                          style={{ background: theme.gradients.primary }}
                        >
                          {relative.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{relative.name}</h3>
                        <p className="text-gray-600">{relative.relationship}</p>
                        {relative.birthDate && (
                          <p className="text-sm text-gray-500">
                            Age {calculateAge(relative.birthDate)}
                          </p>
                        )}
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

                  {relative.birthDate && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Cake className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">Next Birthday</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: theme.colors.primary }}>
                          {getDaysUntilBirthday(relative.birthDate)} days
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {relative.phone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${relative.phone}`);
                          }}
                          className="p-2 rounded-full hover:bg-blue-100 text-blue-500 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      )}
                      {relative.email && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`mailto:${relative.email}`);
                          }}
                          className="p-2 rounded-full hover:bg-green-100 text-green-500 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
              ))}
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

      <div className="max-h-[70vh] overflow-y-auto pr-4" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.colors.primary}40 transparent`
      }}>
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 8px;
          }
          div::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1);
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb {
            background: ${theme.colors.primary}60;
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: ${theme.colors.primary}80;
          }
        `}</style>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Picture */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-3xl backdrop-blur-lg border text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                borderColor: theme.colors.primary + '20'
              }}
            >
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Camera className="w-5 h-5 inline mr-2" />
                Profile Picture
              </label>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {formData.profilePicture ? (
                    <img
                      src={formData.profilePicture}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-4 shadow-lg"
                      style={{ borderColor: theme.colors.primary }}
                    />
                  ) : (
                    <div 
                      className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 shadow-lg"
                      style={{ 
                        background: theme.gradients.primary,
                        borderColor: theme.colors.primary
                      }}
                    >
                      {formData.name ? formData.name.charAt(0).toUpperCase() : <Camera className="w-8 h-8" />}
                    </div>
                  )}
                  <label className="absolute -bottom-2 -right-2 p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform"
                         style={{ background: theme.colors.primary }}>
                    <Upload className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {errors.profilePicture && (
                  <p className="text-red-500 text-sm">{errors.profilePicture}</p>
                )}
                <p className="text-xs text-gray-500 text-center max-w-xs">
                  Upload a photo or we'll use their initials (Max 5MB)
                </p>
              </div>
            </motion.div>

            {/* Basic Information */}
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
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowRelationshipDropdown(!showRelationshipDropdown)}
                      className="w-full px-4 py-3 rounded-xl border-2 text-left flex items-center justify-between transition-all duration-300 focus:outline-none"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderColor: errors.relationship ? '#ef4444' : theme.colors.primary + '20'
                      }}
                    >
                      <span className={formData.relationship ? 'text-gray-800' : 'text-gray-500'}>
                        {formData.relationship || 'Select relationship'}
                      </span>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <AnimatePresence>
                      {showRelationshipDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-20 w-full mt-2 bg-white rounded-xl border shadow-lg max-h-60 overflow-y-auto"
                          style={{ borderColor: theme.colors.primary + '20' }}
                        >
                          {Object.entries(RELATIONSHIP_CATEGORIES).map(([category, relationships]) => (
                            <div key={category}>
                              <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-600 border-b">
                                {category}
                              </div>
                              {relationships.map((relationship) => (
                                <button
                                  key={relationship}
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, relationship }));
                                    setShowRelationshipDropdown(false);
                                    if (errors.relationship) setErrors(prev => ({ ...prev, relationship: '' }));
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 text-gray-800"
                                >
                                  {relationship}
                                </button>
                              ))}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Information */}
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, phone: e.target.value }));
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderColor: errors.phone ? '#ef4444' : theme.colors.primary + '20'
                    }}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
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
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full h-20 p-4 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderColor: theme.colors.primary + '20'
                    }}
                    placeholder="Their home address..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Gift Ideas */}
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
                <Gift className="w-5 h-5 inline mr-2" />
                Gift Ideas
              </label>
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
                        const newIdeas = [...formData.giftIdeas];
                        newIdeas[index] = e.target.value;
                        setFormData(prev => ({ ...prev, giftIdeas: newIdeas }));
                      }}
                      placeholder={`Gift idea ${index + 1}...`}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderColor: theme.colors.primary + '20'
                      }}
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
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Heart className="w-5 h-5 inline mr-2" />
                Personal Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Special memories, preferences, or anything important to remember..."
                className="w-full h-24 p-4 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderColor: theme.colors.primary + '20'
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center pb-8"
        >
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: `0 0 30px ${theme.colors.primary}50`
            }}
            whileTap={{ scale: 0.95 }}
            onClick={saveRelative}
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
                  Saving Relative...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-3" />
                  Save Relative
                  <Heart className="w-5 h-5 ml-3" />
                </>
              )}
            </span>
          </motion.button>
        </motion.div>
      </div>
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
          div::-webkit-scrollbar {
            width: 8px;
          }
          div::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1);
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb {
            background: ${theme.colors.primary}60;
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb:hover {
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
                No birthdays in the next 30 days. Time to relax!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6 pb-6">
              {upcomingBirthdays.map((relative, index) => {
                const daysUntil = getDaysUntilBirthday(relative.birthDate);
                const age = calculateAge(relative.birthDate) + 1; // Next age
                const isToday = daysUntil === 0;
                const isThisWeek = daysUntil <= 7;
                
                return (
                  <motion.div
                    key={relative.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg"
                    style={{
                      background: isToday 
                        ? `linear-gradient(135deg, ${theme.colors.warning}20 0%, ${theme.colors.accent}20 100%)`
                        : isThisWeek
                        ? `linear-gradient(135deg, ${theme.colors.primary}10 0%, ${theme.colors.accent}10 100%)`
                        : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                      borderColor: isToday 
                        ? theme.colors.warning + '60'
                        : isThisWeek 
                        ? theme.colors.primary + '40'
                        : theme.colors.primary + '20'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        {relative.profilePicture ? (
                          <img
                            src={relative.profilePicture}
                            alt={relative.name}
                            className="w-16 h-16 rounded-full object-cover border-4 shadow-lg"
                            style={{ borderColor: theme.colors.primary }}
                          />
                        ) : (
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                            style={{ background: theme.gradients.primary }}
                          >
                            {relative.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{relative.name}</h3>
                          <p className="text-gray-600">{relative.relationship}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-2">
                              <Cake className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Turning {age}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span 
                                className="text-sm font-semibold"
                                style={{ 
                                  color: isToday ? theme.colors.warning : isThisWeek ? theme.colors.primary : theme.colors.accent 
                                }}
                              >
                                {isToday ? 'Today!' : `${daysUntil} days`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-2">
                          {new Date(relative.birthDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        {isToday && (
                          <div 
                            className="px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ background: theme.colors.warning }}
                          >
                            🎉 TODAY
                          </div>
                        )}
                      </div>
                    </div>

                    {relative.giftIdeas.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Gift className="w-4 h-4 mr-2" />
                          Gift Ideas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {relative.giftIdeas.slice(0, 3).map((idea, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {idea}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex space-x-2">
                        {relative.phone && (
                          <button
                            onClick={() => window.open(`tel:${relative.phone}`)}
                            className="p-2 rounded-full hover:bg-blue-100 text-blue-500 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                        )}
                        {relative.email && (
                          <button
                            onClick={() => window.open(`mailto:${relative.email}`)}
                            className="p-2 rounded-full hover:bg-green-100 text-green-500 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => {
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
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const renderViewRelative = () => {
    if (!selectedRelative) return null;

    const age = calculateAge(selectedRelative.birthDate);
    const daysUntilBirthday = getDaysUntilBirthday(selectedRelative.birthDate);

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
              {selectedRelative.profilePicture ? (
                <img
                  src={selectedRelative.profilePicture}
                  alt={selectedRelative.name}
                  className="w-20 h-20 rounded-full object-cover border-4 shadow-lg"
                  style={{ borderColor: theme.colors.primary }}
                />
              ) : (
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                  style={{ background: theme.gradients.primary }}
                >
                  {selectedRelative.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-3xl font-bold text-gray-800">{selectedRelative.name}</h2>
                <p className="text-xl text-gray-600">{selectedRelative.relationship}</p>
                <p className="text-gray-500">Age {age} • Next birthday in {daysUntilBirthday} days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-4" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.colors.primary}40 transparent`
        }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 8px;
            }
            div::-webkit-scrollbar-track {
              background: rgba(0,0,0,0.1);
              border-radius: 4px;
            }
            div::-webkit-scrollbar-thumb {
              background: ${theme.colors.primary}60;
              border-radius: 4px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: ${theme.colors.primary}80;
            }
          `}</style>

          <div className="grid lg:grid-cols-2 gap-8 pb-8">
            {/* Contact Information */}
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
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <User className="w-6 h-6 mr-3" style={{ color: theme.colors.primary }} />
                Contact Information
              </h3>
              
              <div className="space-y-4">
                {selectedRelative.phone && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-700">Phone</span>
                    </div>
                    <button
                      onClick={() => window.open(`tel:${selectedRelative.phone}`)}
                      className="text-blue-500 hover:text-blue-600 font-semibold"
                    >
                      {selectedRelative.phone}
                    </button>
                  </div>
                )}

                {selectedRelative.email && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-700">Email</span>
                    </div>
                    <button
                      onClick={() => window.open(`mailto:${selectedRelative.email}`)}
                      className="text-green-500 hover:text-green-600 font-semibold"
                    >
                      {selectedRelative.email}
                    </button>
                  </div>
                )}

                {selectedRelative.address && (
                  <div className="p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center space-x-3 mb-2">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-700">Address</span>
                    </div>
                    <p className="text-gray-600 ml-8">{selectedRelative.address}</p>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">Birthday</span>
                  </div>
                  <span className="font-semibold" style={{ color: theme.colors.primary }}>
                    {new Date(selectedRelative.birthDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Gift Ideas & Notes */}
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
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Gift className="w-6 h-6 mr-3" style={{ color: theme.colors.accent }} />
                    Gift Ideas
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedRelative.giftIdeas.map((idea, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{ background: theme.colors.primary }}
                        >
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{idea}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Notes */}
              {selectedRelative.notes && (
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
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Heart className="w-6 h-6 mr-3" style={{ color: theme.colors.success }} />
                    Personal Notes
                  </h3>
                  
                  <p className="text-gray-700 leading-relaxed">{selectedRelative.notes}</p>
                </motion.div>
              )}
            </div>
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