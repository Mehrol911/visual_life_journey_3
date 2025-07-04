import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfessionTheme } from '../types';
import { relativesAPI, Relative } from '../lib/database';
import { 
  Users, 
  Plus, 
  Heart, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  X,
  Save,
  Camera,
  Upload,
  Star,
  User,
  ArrowLeft,
  Loader,
  AlertCircle,
  CheckCircle,
  Gift,
  FileText,
  Cake,
  Clock
} from 'lucide-react';

interface RelativesProps {
  theme: ProfessionTheme;
}

type ActiveView = 'overview' | 'add' | 'view' | 'edit' | 'birthdays';

export const Relatives: React.FC<RelativesProps> = ({ theme }) => {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Relative[]>([]);
  const [birthdaysThisMonth, setBirthdaysThisMonth] = useState<Relative[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('');
  const [selectedRelative, setSelectedRelative] = useState<Relative | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state with all new fields
  const [formData, setFormData] = useState<Partial<Relative>>({
    name: '',
    relationship: '',
    birth_date: '',
    description: '',
    contact_info: {},
    image_url: '',
    is_favorite: false,
    gift_ideas: ['', '', ''],
    personal_notes: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Common relationship types
  const relationshipTypes = [
    'Parent', 'Child', 'Sibling', 'Spouse', 'Partner', 'Grandparent', 'Grandchild',
    'Uncle', 'Aunt', 'Cousin', 'Nephew', 'Niece', 'Friend', 'Colleague', 'Mentor', 'Other'
  ];

  // Load relatives and birthday data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [relativesData, upcomingData, monthData] = await Promise.all([
        relativesAPI.getAll(),
        relativesAPI.getUpcomingBirthdays(30),
        relativesAPI.getBirthdaysThisMonth()
      ]);
      
      setRelatives(relativesData);
      setUpcomingBirthdays(upcomingData);
      setBirthdaysThisMonth(monthData);
    } catch (error) {
      console.error('Error loading relatives data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.relationship?.trim()) {
      newErrors.relationship = 'Relationship is required';
    }
    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birth_date = 'Birth date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const relativeData = {
        name: formData.name!,
        relationship: formData.relationship!,
        birth_date: formData.birth_date || undefined,
        description: formData.description || undefined,
        contact_info: formData.contact_info || {},
        image_url: formData.image_url || undefined,
        is_favorite: formData.is_favorite || false,
        gift_ideas: (formData.gift_ideas || []).filter(idea => idea.trim() !== ''),
        personal_notes: formData.personal_notes || undefined
      };

      let newRelative;
      if (selectedRelative && activeView === 'edit') {
        newRelative = await relativesAPI.update(selectedRelative.id, relativeData);
        setRelatives(prev => prev.map(r => r.id === selectedRelative.id ? newRelative : r));
      } else {
        newRelative = await relativesAPI.create(relativeData);
        setRelatives(prev => [newRelative, ...prev]);
      }

      // Refresh birthday data
      const [upcomingData, monthData] = await Promise.all([
        relativesAPI.getUpcomingBirthdays(30),
        relativesAPI.getBirthdaysThisMonth()
      ]);
      setUpcomingBirthdays(upcomingData);
      setBirthdaysThisMonth(monthData);

      resetForm();
      setActiveView('overview');
    } catch (error) {
      console.error('Error saving relative:', error);
      setErrors({ general: 'Failed to save relative. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const deleteRelative = async (id: string) => {
    try {
      await relativesAPI.delete(id);
      setRelatives(prev => prev.filter(r => r.id !== id));
      // Refresh birthday data
      const [upcomingData, monthData] = await Promise.all([
        relativesAPI.getUpcomingBirthdays(30),
        relativesAPI.getBirthdaysThisMonth()
      ]);
      setUpcomingBirthdays(upcomingData);
      setBirthdaysThisMonth(monthData);
    } catch (error) {
      console.error('Error deleting relative:', error);
    }
  };

  const toggleFavorite = async (relative: Relative) => {
    try {
      const updated = await relativesAPI.update(relative.id, {
        is_favorite: !relative.is_favorite
      });
      setRelatives(prev => prev.map(r => r.id === relative.id ? updated : r));
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      birth_date: '',
      description: '',
      contact_info: {},
      image_url: '',
      is_favorite: false,
      gift_ideas: ['', '', ''],
      personal_notes: ''
    });
    setErrors({});
    setSelectedRelative(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setFormData(prev => ({ ...prev, image_url: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateContactInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value
      }
    }));
  };

  const updateGiftIdea = (index: number, value: string) => {
    setFormData(prev => {
      const newGiftIdeas = [...(prev.gift_ideas || ['', '', ''])];
      newGiftIdeas[index] = value;
      return { ...prev, gift_ideas: newGiftIdeas };
    });
  };

  // Get next birthday
  const getNextBirthday = () => {
    if (upcomingBirthdays.length === 0) return null;
    
    const today = new Date();
    let nextBirthday = null;
    let minDays = Infinity;
    
    upcomingBirthdays.forEach(relative => {
      if (!relative.birth_date) return;
      
      const birthDate = new Date(relative.birth_date);
      const thisYear = today.getFullYear();
      const nextYear = thisYear + 1;
      
      const birthdayThisYear = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
      const birthdayNextYear = new Date(nextYear, birthDate.getMonth(), birthDate.getDate());
      
      const timeDiffThisYear = birthdayThisYear.getTime() - today.getTime();
      const timeDiffNextYear = birthdayNextYear.getTime() - today.getTime();
      const daysDiffThisYear = Math.ceil(timeDiffThisYear / (1000 * 3600 * 24));
      const daysDiffNextYear = Math.ceil(timeDiffNextYear / (1000 * 3600 * 24));
      
      if (daysDiffThisYear >= 0 && daysDiffThisYear < minDays) {
        minDays = daysDiffThisYear;
        nextBirthday = { relative, days: daysDiffThisYear };
      } else if (daysDiffNextYear >= 0 && daysDiffNextYear < minDays) {
        minDays = daysDiffNextYear;
        nextBirthday = { relative, days: daysDiffNextYear };
      }
    });
    
    return nextBirthday;
  };

  // Filter relatives
  const filteredRelatives = relatives.filter(relative => {
    const matchesSearch = relative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relative.relationship.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRelationship = !filterRelationship || relative.relationship === filterRelationship;
    return matchesSearch && matchesRelationship;
  });

  // Sort relatives: favorites first, then alphabetically
  const sortedRelatives = [...filteredRelatives].sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return a.name.localeCompare(b.name);
  });

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

  const nextBirthday = getNextBirthday();

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Enhanced Statistics */}
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
                {birthdaysThisMonth.length}
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
          className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
            borderColor: theme.colors.primary + '20'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Next Birthday</p>
              <p className="text-lg font-bold" style={{ color: theme.colors.warning }}>
                {nextBirthday ? `${nextBirthday.relative.name.split(' ')[0]}` : 'None soon'}
              </p>
              {nextBirthday && (
                <p className="text-xs text-gray-500">
                  {nextBirthday.days === 0 ? 'Today!' : `${nextBirthday.days} days`}
                </p>
              )}
            </div>
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: theme.gradients.primary }}
            >
              <Clock className="w-6 h-6 text-white" />
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
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterRelationship}
            onChange={(e) => setFilterRelationship(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 focus:outline-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <option value="">All Relationships</option>
            {relationshipTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
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
          onClick={() => {
            resetForm();
            setActiveView('add');
          }}
          className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300"
          style={{ 
            background: theme.gradients.primary,
            boxShadow: `0 4px 20px ${theme.colors.primary}40`
          }}
        >
          <Plus className="w-5 h-5 inline mr-2" />
          Add Relative
        </motion.button>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin" style={{ color: theme.colors.primary }} />
          <span className="ml-3 text-gray-600">Loading your relatives...</span>
        </div>
      )}

      {/* Relatives Grid */}
      {!loading && (
        <AnimatePresence mode="wait">
          {sortedRelatives.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <Users className="w-24 h-24 mx-auto mb-6 text-gray-300" />
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                Build Your Family Network
              </h3>
              <p className="text-gray-500 mb-8">
                Start adding your loved ones to never miss important moments
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetForm();
                  setActiveView('add');
                }}
                className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
                style={{ background: theme.gradients.primary }}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add Your First Relative
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sortedRelatives.map((relative, index) => (
                <motion.div
                  key={relative.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                    borderColor: relative.is_favorite ? theme.colors.accent + '40' : theme.colors.primary + '20'
                  }}
                  onClick={() => {
                    setSelectedRelative(relative);
                    setActiveView('view');
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      {relative.image_url ? (
                        <img
                          src={relative.image_url}
                          alt={relative.name}
                          className="w-16 h-16 rounded-full object-cover border-4 shadow-lg"
                          style={{ borderColor: relative.is_favorite ? theme.colors.accent : theme.colors.primary }}
                        />
                      ) : (
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                          style={{ background: relative.is_favorite ? theme.colors.accent : theme.colors.primary }}
                        >
                          {relative.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                          {relative.name}
                          {relative.is_favorite && (
                            <Star className="w-4 h-4 ml-2 text-yellow-400 fill-yellow-400" />
                          )}
                        </h3>
                        <p className="text-gray-600">{relative.relationship}</p>
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

                  {relative.birth_date && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {new Date(relative.birth_date).toLocaleDateString()} 
                        {' '} ({calculateAge(relative.birth_date)} years)
                      </span>
                    </div>
                  )}

                  {relative.gift_ideas && relative.gift_ideas.length > 0 && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Gift className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {relative.gift_ideas.filter(idea => idea.trim()).length} gift ideas
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(relative);
                      }}
                      className="flex items-center text-sm font-semibold transition-colors duration-200"
                      style={{ color: relative.is_favorite ? theme.colors.accent : theme.colors.primary }}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${relative.is_favorite ? 'fill-current' : ''}`} />
                      {relative.is_favorite ? 'Favorite' : 'Add to Favorites'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({
                          ...relative,
                          gift_ideas: relative.gift_ideas?.length ? relative.gift_ideas : ['', '', '']
                        });
                        setSelectedRelative(relative);
                        setActiveView('edit');
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-blue-100 text-blue-500 transition-all duration-300"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );

  const renderForm = (isEdit: boolean = false) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center mb-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (isEdit && selectedRelative) {
              setActiveView('view');
            } else {
              setActiveView('overview');
            }
            resetForm();
          }}
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
            {isEdit ? 'Edit Relative' : 'Add New Relative'}
          </h2>
          <p className="text-gray-600">
            Keep your loved ones close to your heart
          </p>
        </div>
      </div>

      {/* Error Display */}
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl border flex items-center"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444',
            color: '#ef4444'
          }}
        >
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm">{errors.general}</span>
        </motion.div>
      )}

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
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Relative profile"
                    className="w-32 h-32 rounded-full object-cover border-4 shadow-lg"
                    style={{ borderColor: theme.colors.primary }}
                  />
                ) : (
                  <div 
                    className="w-32 h-32 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 shadow-lg"
                    style={{ 
                      background: theme.gradients.primary,
                      borderColor: theme.colors.primary
                    }}
                  >
                    {formData.name ? formData.name.charAt(0).toUpperCase() : <Camera className="w-12 h-12" />}
                  </div>
                )}
                <label className="absolute -bottom-2 -right-2 p-3 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform"
                       style={{ background: theme.colors.primary }}>
                  <Upload className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
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
            <h3 className="text-lg font-bold text-gray-800 mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (errors.name) {
                      setErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: errors.name ? '#ef4444' : theme.colors.primary + '20'
                  }}
                  placeholder="Enter their full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Relationship *
                </label>
                <select
                  value={formData.relationship || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, relationship: e.target.value }));
                    if (errors.relationship) {
                      setErrors(prev => ({ ...prev, relationship: '' }));
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: errors.relationship ? '#ef4444' : theme.colors.primary + '20'
                  }}
                >
                  <option value="">Select relationship</option>
                  {relationshipTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.relationship && (
                  <p className="text-red-500 text-sm mt-1">{errors.relationship}</p>
                )}
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Birth Date *
                </label>
                <input
                  type="date"
                  value={formData.birth_date || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, birth_date: e.target.value }));
                    if (errors.birth_date) {
                      setErrors(prev => ({ ...prev, birth_date: '' }));
                    }
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: errors.birth_date ? '#ef4444' : theme.colors.primary + '20'
                  }}
                />
                {errors.birth_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>
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
            <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h3>
            
            <div className="space-y-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={(formData.contact_info as any)?.phone || ''}
                  onChange={(e) => updateContactInfo('phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: theme.colors.primary + '20'
                  }}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={(formData.contact_info as any)?.email || ''}
                  onChange={(e) => updateContactInfo('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: theme.colors.primary + '20'
                  }}
                  placeholder="their.email@example.com"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Address
                </label>
                <input
                  type="text"
                  value={(formData.contact_info as any)?.address || ''}
                  onChange={(e) => updateContactInfo('address', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
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
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Gift className="w-5 h-5 mr-2" />
              Gift Ideas
            </h3>
            
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative">
                  <div 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: theme.colors.primary }}
                  >
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={formData.gift_ideas?.[index] || ''}
                    onChange={(e) => updateGiftIdea(index, e.target.value)}
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

          {/* Personal Notes */}
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
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Personal Notes
            </h3>
            <textarea
              value={formData.personal_notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, personal_notes: e.target.value }))}
              placeholder="Special memories, preferences, or anything important to remember..."
              className="w-full h-32 p-4 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none"
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
        className="mt-8 text-center"
      >
        <motion.button
          whileHover={{ 
            scale: 1.05,
            boxShadow: `0 0 30px ${theme.colors.primary}50`
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={saving}
          className="px-12 py-4 rounded-full text-white font-semibold text-lg relative overflow-hidden group shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            background: theme.gradients.primary,
            boxShadow: `0 4px 20px ${theme.colors.primary}40`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center">
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-3" />
                Saving...
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
    </motion.div>
  );

  const renderViewRelative = () => {
    if (!selectedRelative) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-6xl mx-auto"
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
                {selectedRelative.name}
                {selectedRelative.is_favorite && (
                  <Star className="w-5 h-5 ml-2 text-yellow-400 fill-yellow-400" />
                )}
              </h2>
              <p className="text-gray-600">{selectedRelative.relationship}</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setFormData({
                  ...selectedRelative,
                  gift_ideas: selectedRelative.gift_ideas?.length ? selectedRelative.gift_ideas : ['', '', '']
                });
                setActiveView('edit');
              }}
              className="p-3 rounded-xl border transition-all duration-300"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: theme.colors.primary + '20'
              }}
            >
              <Edit3 className="w-5 h-5" style={{ color: theme.colors.primary }} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleFavorite(selectedRelative)}
              className="p-3 rounded-xl border transition-all duration-300"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: selectedRelative.is_favorite ? theme.colors.accent + '40' : theme.colors.primary + '20'
              }}
            >
              <Heart className={`w-5 h-5 ${selectedRelative.is_favorite ? 'fill-current' : ''}`} 
                    style={{ color: selectedRelative.is_favorite ? theme.colors.accent : theme.colors.primary }} />
            </motion.button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile and Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Profile Picture */}
            <div className="p-6 rounded-3xl backdrop-blur-lg border text-center"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                   borderColor: theme.colors.primary + '20'
                 }}>
              {selectedRelative.image_url ? (
                <img
                  src={selectedRelative.image_url}
                  alt={selectedRelative.name}
                  className="w-40 h-40 rounded-full object-cover border-4 shadow-lg mx-auto"
                  style={{ borderColor: selectedRelative.is_favorite ? theme.colors.accent : theme.colors.primary }}
                />
              ) : (
                <div 
                  className="w-40 h-40 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 shadow-lg mx-auto"
                  style={{ 
                    background: selectedRelative.is_favorite ? theme.colors.accent : theme.colors.primary,
                    borderColor: selectedRelative.is_favorite ? theme.colors.accent : theme.colors.primary
                  }}
                >
                  {selectedRelative.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="p-6 rounded-3xl backdrop-blur-lg border"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                   borderColor: theme.colors.primary + '20'
                 }}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Relationship</p>
                    <p className="font-semibold text-gray-800">{selectedRelative.relationship}</p>
                  </div>
                </div>
                
                {selectedRelative.birth_date && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Birth Date</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(selectedRelative.birth_date).toLocaleDateString()} 
                        {' '} ({calculateAge(selectedRelative.birth_date)} years)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-6 rounded-3xl backdrop-blur-lg border"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                   borderColor: theme.colors.primary + '20'
                 }}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h3>
              
              {(selectedRelative.contact_info && 
                Object.keys(selectedRelative.contact_info).length > 0 &&
                Object.values(selectedRelative.contact_info).some(v => v)) ? (
                <div className="space-y-4">
                  {(selectedRelative.contact_info as any).phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-semibold text-gray-800">{(selectedRelative.contact_info as any).phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {(selectedRelative.contact_info as any).email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold text-gray-800">{(selectedRelative.contact_info as any).email}</p>
                      </div>
                    </div>
                  )}
                  
                  {(selectedRelative.contact_info as any).address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-semibold text-gray-800">{(selectedRelative.contact_info as any).address}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No contact information available</p>
              )}
            </div>
          </motion.div>

          {/* Gift Ideas and Notes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Gift Ideas */}
            <div className="p-6 rounded-3xl backdrop-blur-lg border"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                   borderColor: theme.colors.primary + '20'
                 }}>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Gift className="w-5 h-5 mr-2" style={{ color: theme.colors.primary }} />
                Gift Ideas
              </h3>
              
              {selectedRelative.gift_ideas && selectedRelative.gift_ideas.filter(idea => idea.trim()).length > 0 ? (
                <div className="space-y-3">
                  {selectedRelative.gift_ideas.filter(idea => idea.trim()).map((idea, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white mt-0.5 flex-shrink-0"
                        style={{ background: theme.colors.primary }}
                      >
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{idea}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No gift ideas added yet</p>
              )}
            </div>

            {/* Personal Notes */}
            <div className="p-6 rounded-3xl backdrop-blur-lg border"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                   borderColor: theme.colors.primary + '20'
                 }}>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" style={{ color: theme.colors.accent }} />
                Personal Notes
              </h3>
              
              {selectedRelative.personal_notes ? (
                <div className="p-4 rounded-xl bg-gray-50">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedRelative.personal_notes}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No personal notes available</p>
              )}
            </div>

            {/* Description */}
            {selectedRelative.description && (
              <div className="p-6 rounded-3xl backdrop-blur-lg border"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                     borderColor: theme.colors.primary + '20'
                   }}>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedRelative.description}</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const renderBirthdays = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto"
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
          <h2 className="text-3xl font-bold text-gray-800">Upcoming Birthdays</h2>
          <p className="text-gray-600">Never miss an important celebration</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* This Month */}
        {birthdaysThisMonth.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Cake className="w-6 h-6 mr-2" style={{ color: theme.colors.primary }} />
              This Month ({birthdaysThisMonth.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {birthdaysThisMonth.map((relative, index) => (
                <motion.div
                  key={relative.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-2xl backdrop-blur-lg border shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                    borderColor: theme.colors.primary + '20'
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {relative.image_url ? (
                      <img
                        src={relative.image_url}
                        alt={relative.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ background: theme.colors.primary }}
                      >
                        {relative.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{relative.name}</p>
                      <p className="text-sm text-gray-600">{relative.relationship}</p>
                      <p className="text-xs text-gray-500">
                        {relative.birth_date && new Date(relative.birth_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Next 30 Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Clock className="w-6 h-6 mr-2" style={{ color: theme.colors.accent }} />
            Next 30 Days ({upcomingBirthdays.length})
          </h3>
          {upcomingBirthdays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingBirthdays.map((relative, index) => {
                const birthDate = new Date(relative.birth_date!);
                const today = new Date();
                const thisYear = today.getFullYear();
                const nextYear = thisYear + 1;
                
                const birthdayThisYear = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
                const birthdayNextYear = new Date(nextYear, birthDate.getMonth(), birthDate.getDate());
                
                const timeDiffThisYear = birthdayThisYear.getTime() - today.getTime();
                const timeDiffNextYear = birthdayNextYear.getTime() - today.getTime();
                const daysDiffThisYear = Math.ceil(timeDiffThisYear / (1000 * 3600 * 24));
                const daysDiffNextYear = Math.ceil(timeDiffNextYear / (1000 * 3600 * 24));
                
                const daysUntil = daysDiffThisYear >= 0 ? daysDiffThisYear : daysDiffNextYear;
                
                return (
                  <motion.div
                    key={relative.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-2xl backdrop-blur-lg border shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                      borderColor: theme.colors.primary + '20'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {relative.image_url ? (
                          <img
                            src={relative.image_url}
                            alt={relative.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ background: theme.colors.primary }}
                          >
                            {relative.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{relative.name}</p>
                          <p className="text-sm text-gray-600">{relative.relationship}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div 
                          className="text-lg font-bold"
                          style={{ color: theme.colors.primary }}
                        >
                          {daysUntil === 0 ? 'Today!' : `${daysUntil} days`}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        Turning {calculateAge(relative.birth_date!) + 1}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No upcoming birthdays in the next 30 days</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: theme.colors.primary }} />
          <p className="text-gray-600">Loading your relatives...</p>
        </div>
      </div>
    );
  }

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
          {activeView === 'add' && renderForm(false)}
          {activeView === 'edit' && renderForm(true)}
          {activeView === 'view' && renderViewRelative()}
          {activeView === 'birthdays' && renderBirthdays()}
        </AnimatePresence>
      </div>
    </div>
  );
};