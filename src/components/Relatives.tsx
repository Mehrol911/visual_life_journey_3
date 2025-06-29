import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfessionTheme } from '../types';
import { 
  Users, 
  Plus, 
  Calendar, 
  Gift, 
  Heart, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  ArrowLeft,
  Save,
  X,
  User,
  Cake,
  Clock,
  Star,
  Camera,
  Upload,
  Eye,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

interface Relative {
  id: string;
  name: string;
  relationship: string;
  birthday: string; // YYYY-MM-DD format
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  giftIdeas: string[];
  imageUrl?: string;
  createdAt: string;
}

interface RelativesProps {
  theme: ProfessionTheme;
}

type ActiveView = 'overview' | 'add' | 'view' | 'upcoming';
type FilterType = 'all' | 'family' | 'friends' | 'colleagues';

const RELATIONSHIP_OPTIONS = [
  'Parent', 'Sibling', 'Child', 'Grandparent', 'Grandchild', 'Aunt/Uncle', 'Cousin',
  'Spouse/Partner', 'Friend', 'Best Friend', 'Colleague', 'Mentor', 'Other'
];

export const Relatives: React.FC<RelativesProps> = ({ theme }) => {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [relatives, setRelatives] = useState<Relative[]>([
    {
      id: '1',
      name: 'sddsd',
      relationship: 'Sibling',
      birthday: '2001-06-30',
      email: 'sibling@example.com',
      phone: '+1234567890',
      giftIdeas: ['1221212', '21121212', '1212'],
      notes: 'Loves technology and gaming',
      createdAt: new Date().toISOString()
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedRelative, setSelectedRelative] = useState<Relative | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    birthday: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    giftIdeas: ['', '', ''],
    imageUrl: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);

  // Calculate upcoming birthdays (next 30 days)
  const getUpcomingBirthdays = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return relatives.filter(relative => {
      const birthday = new Date(relative.birthday);
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
      const nextYearBirthday = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
      
      return (thisYearBirthday >= today && thisYearBirthday <= thirtyDaysFromNow) ||
             (nextYearBirthday >= today && nextYearBirthday <= thirtyDaysFromNow);
    }).sort((a, b) => {
      const birthdayA = new Date(a.birthday);
      const birthdayB = new Date(b.birthday);
      const thisYearA = new Date(today.getFullYear(), birthdayA.getMonth(), birthdayA.getDate());
      const thisYearB = new Date(today.getFullYear(), birthdayB.getMonth(), birthdayB.getDate());
      
      if (thisYearA < today) thisYearA.setFullYear(today.getFullYear() + 1);
      if (thisYearB < today) thisYearB.setFullYear(today.getFullYear() + 1);
      
      return thisYearA.getTime() - thisYearB.getTime();
    });
  };

  // Calculate days until birthday
  const getDaysUntilBirthday = (birthday: string): number => {
    const today = new Date();
    const birthdayDate = new Date(birthday);
    const thisYearBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
    
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = thisYearBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate age
  const calculateAge = (birthday: string): number => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.relationship) {
      newErrors.relationship = 'Relationship is required';
    }

    if (!formData.birthday) {
      newErrors.birthday = 'Birthday is required';
    } else {
      const birthday = new Date(formData.birthday);
      const today = new Date();
      if (birthday > today) {
        newErrors.birthday = 'Birthday cannot be in the future';
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
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRelative: Relative = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      relationship: formData.relationship,
      birthday: formData.birthday,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      address: formData.address.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      giftIdeas: formData.giftIdeas.filter(idea => idea.trim()),
      imageUrl: formData.imageUrl || undefined,
      createdAt: new Date().toISOString()
    };

    setRelatives(prev => [...prev, newRelative]);

    // Reset form
    setFormData({
      name: '',
      relationship: '',
      birthday: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      giftIdeas: ['', '', ''],
      imageUrl: ''
    });
    
    setErrors({});
    setIsSubmitting(false);
    setActiveView('overview');
  };

  const deleteRelative = (id: string) => {
    setRelatives(prev => prev.filter(r => r.id !== id));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setFormData(prev => ({ ...prev, imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const upcomingBirthdays = getUpcomingBirthdays();
  const nextBirthday = upcomingBirthdays[0];

  const filteredRelatives = relatives.filter(relative => {
    const matchesSearch = relative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relative.relationship.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterType === 'family') {
      matchesFilter = ['Parent', 'Sibling', 'Child', 'Grandparent', 'Grandchild', 'Aunt/Uncle', 'Cousin', 'Spouse/Partner'].includes(relative.relationship);
    } else if (filterType === 'friends') {
      matchesFilter = ['Friend', 'Best Friend'].includes(relative.relationship);
    } else if (filterType === 'colleagues') {
      matchesFilter = ['Colleague', 'Mentor'].includes(relative.relationship);
    }
    
    return matchesSearch && matchesFilter;
  });

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 h-full overflow-y-auto"
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
                {relatives.filter(r => {
                  const birthday = new Date(r.birthday);
                  const today = new Date();
                  return birthday.getMonth() === today.getMonth();
                }).length}
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
                {nextBirthday ? `${getDaysUntilBirthday(nextBirthday.birthday)} days` : 'None soon'}
              </p>
              {nextBirthday && (
                <p className="text-xs text-gray-500 mt-1">{nextBirthday.name}</p>
              )}
            </div>
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: theme.gradients.primary }}
            >
              <Star className="w-6 h-6 text-white" />
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="px-4 py-3 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 focus:outline-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <option value="all">All Relationships</option>
            <option value="family">Family</option>
            <option value="friends">Friends</option>
            <option value="colleagues">Colleagues</option>
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveView('upcoming')}
          className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 flex items-center"
          style={{ 
            background: theme.gradients.primary,
            boxShadow: `0 4px 20px ${theme.colors.primary}40`
          }}
        >
          <Calendar className="w-5 h-5 mr-2" />
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
      </motion.div>

      {/* Relatives Grid */}
      <div className="flex-1 overflow-y-auto">
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8"
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
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      {relative.imageUrl ? (
                        <img
                          src={relative.imageUrl}
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
                        <p className="text-sm text-gray-500">
                          Age {calculateAge(relative.birthday)}
                        </p>
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
                          {new Date(relative.birthday).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="text-sm font-semibold" style={{ color: theme.colors.primary }}>
                        {getDaysUntilBirthday(relative.birthday)} days
                      </div>
                    </div>

                    {relative.giftIdeas.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Gift className="w-4 h-4 mr-1" />
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
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const renderUpcomingBirthdays = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full overflow-y-auto"
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
            <Star className="w-8 h-8 mr-3" style={{ color: theme.colors.primary }} />
            Upcoming Birthdays
          </h2>
          <p className="text-gray-600">Next 30 days • Plan ahead and show you care</p>
        </div>
      </div>

      <div className="space-y-6 pb-8">
        {upcomingBirthdays.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Calendar className="w-24 h-24 mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">No Upcoming Birthdays</h3>
            <p className="text-gray-500">No birthdays in the next 30 days</p>
          </motion.div>
        ) : (
          upcomingBirthdays.map((relative, index) => {
            const daysUntil = getDaysUntilBirthday(relative.birthday);
            const age = calculateAge(relative.birthday) + 1; // Next age
            
            return (
              <motion.div
                key={relative.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                  borderColor: daysUntil <= 7 ? theme.colors.warning : theme.colors.primary + '20',
                  borderWidth: daysUntil <= 7 ? '3px' : '1px'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {relative.imageUrl ? (
                      <img
                        src={relative.imageUrl}
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
                      <div className="flex items-center space-x-2 mt-1">
                        <Cake className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Turning {age}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div 
                      className="text-2xl font-bold mb-1"
                      style={{ color: daysUntil <= 7 ? theme.colors.warning : theme.colors.primary }}
                    >
                      {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(relative.birthday).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    {daysUntil <= 7 && (
                      <div className="mt-2">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: theme.colors.warning }}
                        >
                          {daysUntil === 0 ? '🎉' : '⏰'} {daysUntil === 0 ? 'Today' : 'Soon'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {relative.giftIdeas.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Gift className="w-4 h-4 mr-1" />
                      Gift Ideas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {relative.giftIdeas.map((idea, idx) => (
                        <div 
                          key={idx}
                          className="p-2 rounded-lg text-sm text-center"
                          style={{ 
                            backgroundColor: theme.colors.primary + '10',
                            color: theme.colors.primary 
                          }}
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mx-auto mb-1"
                            style={{ background: theme.colors.primary }}
                          >
                            {idx + 1}
                          </div>
                          {idea}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
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
            );
          })
        )}
      </div>
    </motion.div>
  );

  const renderViewDetails = () => {
    if (!selectedRelative) return null;

    const age = calculateAge(selectedRelative.birthday);
    const daysUntil = getDaysUntilBirthday(selectedRelative.birthday);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="h-full overflow-y-auto"
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
              {selectedRelative.imageUrl ? (
                <img
                  src={selectedRelative.imageUrl}
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
                <p className="text-gray-500">Age {age}</p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Next Birthday</div>
            <div 
              className="text-2xl font-bold"
              style={{ color: daysUntil <= 7 ? theme.colors.warning : theme.colors.primary }}
            >
              {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(selectedRelative.birthday).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 pb-8">
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
              {selectedRelative.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{selectedRelative.email}</p>
                  </div>
                </div>
              )}
              
              {selectedRelative.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-800">{selectedRelative.phone}</p>
                  </div>
                </div>
              )}
              
              {selectedRelative.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-800">{selectedRelative.address}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Birthday</p>
                  <p className="text-gray-800">
                    {new Date(selectedRelative.birthday).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gift Ideas & Notes */}
          <div className="space-y-6">
            {/* Gift Ideas */}
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
              
              {selectedRelative.giftIdeas.length > 0 ? (
                <div className="space-y-3">
                  {selectedRelative.giftIdeas.map((idea, index) => (
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
                <p className="text-gray-500 italic">No gift ideas added yet</p>
              )}
            </motion.div>

            {/* Notes */}
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
                Notes
              </h3>
              
              {selectedRelative.notes ? (
                <p className="text-gray-700 leading-relaxed">{selectedRelative.notes}</p>
              ) : (
                <p className="text-gray-500 italic">No notes added yet</p>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderAddForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full overflow-y-auto"
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

      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 pb-8">
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
                Profile Picture (Optional)
              </label>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Profile"
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
                    Name *
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
                    placeholder="Enter their name"
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
                          {RELATIONSHIP_OPTIONS.map((relationship) => (
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
                    Birthday *
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, birthday: e.target.value }));
                      if (errors.birthday) setErrors(prev => ({ ...prev, birthday: '' }));
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderColor: errors.birthday ? '#ef4444' : theme.colors.primary + '20'
                    }}
                  />
                  {errors.birthday && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.birthday}
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
                    Phone
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
                    placeholder="Their address..."
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Gift Ideas</h3>
              
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
                      value={formData.giftIdeas[index]}
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
              
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
          className="text-center pb-8"
        >
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: `0 0 30px ${theme.colors.primary}50`
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name || !formData.relationship || !formData.birthday}
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
      </div>
    </motion.div>
  );

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

      <div className="max-w-7xl mx-auto relative z-10 h-full">
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
        <div className="h-[calc(100vh-200px)]">
          <AnimatePresence mode="wait">
            {activeView === 'overview' && renderOverview()}
            {activeView === 'upcoming' && renderUpcomingBirthdays()}
            {activeView === 'view' && renderViewDetails()}
            {activeView === 'add' && renderAddForm()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};