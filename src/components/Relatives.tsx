import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfessionTheme } from '../types';
import { 
  Users,
  Plus,
  Calendar,
  Phone,
  Gift,
  Heart,
  Edit3,
  Trash2,
  Search,
  Filter,
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Cake,
  Star,
  Clock,
  User,
  Mail,
  MapPin,
  Lightbulb,
  PartyPopper,
  Camera,
  Upload,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Relative {
  id: string;
  name: string;
  relationship: string;
  birthday: string; // YYYY-MM-DD format
  phone?: string;
  email?: string;
  address?: string;
  giftIdeas: string[];
  notes?: string;
  imageUrl?: string;
  favoriteThings?: string[];
  createdAt: string;
}

interface RelativesProps {
  theme: ProfessionTheme;
}

type ActiveView = 'overview' | 'add' | 'view' | 'upcoming';

const RELATIONSHIP_TYPES = [
  'Parent', 'Sibling', 'Child', 'Grandparent', 'Grandchild', 'Spouse/Partner',
  'Aunt/Uncle', 'Cousin', 'Niece/Nephew', 'In-law', 'Friend', 'Other'
];

export const Relatives: React.FC<RelativesProps> = ({ theme }) => {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('');
  const [selectedRelative, setSelectedRelative] = useState<Relative | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Form state for adding new relative
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    birthday: '',
    phone: '',
    email: '',
    address: '',
    giftIdeas: ['', '', ''],
    notes: '',
    imageUrl: '',
    favoriteThings: ['', '', '']
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const itemsPerPage = 6;

  // Generate year options (from 1900 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => 1900 + i);
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Date validation
  const validateDate = (date: string): boolean => {
    const selectedDate = new Date(date);
    const today = new Date();
    const minDate = new Date('1900-01-01');
    
    return selectedDate >= minDate && selectedDate <= today && !isNaN(selectedDate.getTime());
  };

  // Phone validation
  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^\+[1-9]\d{1,14}$/; // International format starting with +
    return phoneRegex.test(phone);
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Relationship validation
    if (!formData.relationship) {
      newErrors.relationship = 'Relationship is required';
    }

    // Birthday validation
    if (!formData.birthday) {
      newErrors.birthday = 'Birthday is required';
    } else if (!validateDate(formData.birthday)) {
      newErrors.birthday = 'Please enter a valid date between 1900 and today';
    }

    // Phone validation
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Phone number must be in international format (e.g., +1234567890)';
    }

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Gift ideas validation
    if (formData.giftIdeas.some(idea => idea.trim() && idea.trim().length < 3)) {
      newErrors.giftIdeas = 'Gift ideas must be at least 3 characters long';
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
      birthday: formData.birthday,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      giftIdeas: formData.giftIdeas.filter(idea => idea.trim()).map(idea => idea.trim()),
      notes: formData.notes.trim() || undefined,
      imageUrl: formData.imageUrl || undefined,
      favoriteThings: formData.favoriteThings.filter(thing => thing.trim()).map(thing => thing.trim()),
      createdAt: new Date().toISOString()
    };

    setRelatives(prev => [newRelative, ...prev].sort((a, b) => a.name.localeCompare(b.name)));

    // Reset form
    setFormData({
      name: '',
      relationship: '',
      birthday: '',
      phone: '',
      email: '',
      address: '',
      giftIdeas: ['', '', ''],
      notes: '',
      imageUrl: '',
      favoriteThings: ['', '', '']
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

  const toggleCardExpansion = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Get upcoming birthdays (next 30 days)
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

  // Days until next birthday
  const daysUntilBirthday = (birthday: string): number => {
    const today = new Date();
    const birthDate = new Date(birthday);
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = thisYearBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter relatives
  const filteredRelatives = relatives.filter(relative => {
    const matchesSearch = relative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relative.relationship.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRelationship = !filterRelationship || relative.relationship === filterRelationship;
    return matchesSearch && matchesRelationship;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRelatives.length / itemsPerPage);
  const paginatedRelatives = filteredRelatives.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const upcomingBirthdays = getUpcomingBirthdays();

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
              <Cake className="w-6 h-6 text-white" />
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
              <Calendar className="w-6 h-6 text-white" />
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
          onClick={() => setActiveView('upcoming')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Next Birthday</p>
              <p className="text-lg font-bold" style={{ color: theme.colors.warning }}>
                {upcomingBirthdays.length > 0 
                  ? `${daysUntilBirthday(upcomingBirthdays[0].birthday)} days`
                  : 'None soon'
                }
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: theme.gradients.primary }}
            >
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
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
            placeholder="Search relatives by name or relationship..."
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
            {RELATIONSHIP_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveView('upcoming')}
          className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300"
          style={{ 
            background: theme.gradients.primary,
            boxShadow: `0 4px 20px ${theme.colors.primary}40`
          }}
        >
          <Cake className="w-5 h-5 inline mr-2" />
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
      <AnimatePresence mode="wait">
        {paginatedRelatives.length === 0 ? (
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paginatedRelatives.map((relative, index) => {
              const isExpanded = expandedCards.has(relative.id);
              const age = calculateAge(relative.birthday);
              const daysUntil = daysUntilBirthday(relative.birthday);
              
              return (
                <motion.div
                  key={relative.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-3xl backdrop-blur-lg border shadow-lg hover:shadow-xl transition-all duration-300 group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                    borderColor: theme.colors.primary + '20'
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3 flex-1">
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
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{relative.name}</h3>
                        <p className="text-gray-600">{relative.relationship}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Cake className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Age {age} • {daysUntil} days until birthday
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleCardExpansion(relative.id)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteRelative(relative.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-100 text-red-500 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {relative.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a 
                          href={`tel:${relative.phone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {relative.phone}
                        </a>
                      </div>
                    )}
                    {relative.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <a 
                          href={`mailto:${relative.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {relative.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 border-t border-gray-200 pt-4"
                      >
                        {/* Gift Ideas */}
                        {relative.giftIdeas.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                              <Gift className="w-4 h-4 mr-2" style={{ color: theme.colors.primary }} />
                              Gift Ideas
                            </h4>
                            <div className="space-y-1">
                              {relative.giftIdeas.map((idea, idx) => (
                                <div key={idx} className="flex items-start space-x-2">
                                  <div 
                                    className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 flex-shrink-0"
                                    style={{ background: theme.colors.primary }}
                                  >
                                    {idx + 1}
                                  </div>
                                  <p className="text-sm text-gray-600">{idea}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Favorite Things */}
                        {relative.favoriteThings && relative.favoriteThings.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                              <Star className="w-4 h-4 mr-2" style={{ color: theme.colors.accent }} />
                              Favorite Things
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {relative.favoriteThings.map((thing, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                  style={{ background: theme.colors.accent }}
                                >
                                  {thing}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Address */}
                        {relative.address && (
                          <div>
                            <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                              <MapPin className="w-4 h-4 mr-2" style={{ color: theme.colors.success }} />
                              Address
                            </h4>
                            <p className="text-sm text-gray-600">{relative.address}</p>
                          </div>
                        )}

                        {/* Notes */}
                        {relative.notes && (
                          <div>
                            <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                              <Lightbulb className="w-4 h-4 mr-2" style={{ color: theme.colors.warning }} />
                              Notes
                            </h4>
                            <p className="text-sm text-gray-600 italic">"{relative.notes}"</p>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex space-x-2 pt-2">
                          {relative.phone && (
                            <a
                              href={`tel:${relative.phone}`}
                              className="flex-1 py-2 px-3 rounded-lg text-center text-sm font-medium text-white transition-colors"
                              style={{ background: theme.colors.primary }}
                            >
                              Call
                            </a>
                          )}
                          {relative.email && (
                            <a
                              href={`mailto:${relative.email}`}
                              className="flex-1 py-2 px-3 rounded-lg text-center text-sm font-medium text-white transition-colors"
                              style={{ background: theme.colors.accent }}
                            >
                              Email
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
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
          <h2 className="text-3xl font-bold text-gray-800">Add New Relative</h2>
          <p className="text-gray-600">Keep track of your loved ones and never miss special moments</p>
        </div>
      </div>

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
              Profile Picture (Optional)
            </label>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
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
              <p className="text-xs text-gray-500 text-center max-w-xs">
                Upload a photo or we'll use their initials
              </p>
            </div>
          </motion.div>

          {/* Basic Info */}
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
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  <User className="w-5 h-5 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
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
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </motion.p>
                )}
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  <Heart className="w-5 h-5 inline mr-2" />
                  Relationship *
                </label>
                <select
                  value={formData.relationship}
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
                  {RELATIONSHIP_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.relationship && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.relationship}
                  </motion.p>
                )}
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  <Cake className="w-5 h-5 inline mr-2" />
                  Birthday *
                </label>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, birthday: e.target.value }));
                    if (errors.birthday) {
                      setErrors(prev => ({ ...prev, birthday: '' }));
                    }
                  }}
                  min="1900-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: errors.birthday ? '#ef4444' : theme.colors.primary + '20'
                  }}
                />
                {errors.birthday && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.birthday}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="space-y-4">
              {/* Phone */}
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
                    if (errors.phone) {
                      setErrors(prev => ({ ...prev, phone: '' }));
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: errors.phone ? '#ef4444' : theme.colors.primary + '20'
                  }}
                  placeholder="+1234567890"
                />
                {errors.phone && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </motion.p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Use international format starting with +
                </p>
              </div>

              {/* Email */}
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
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: errors.email ? '#ef4444' : theme.colors.primary + '20'
                  }}
                  placeholder="their.email@example.com"
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
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
                      if (errors.giftIdeas) {
                        setErrors(prev => ({ ...prev, giftIdeas: '' }));
                      }
                    }}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderColor: errors.giftIdeas ? '#ef4444' : theme.colors.primary + '20'
                    }}
                    placeholder={`Gift idea ${index + 1}...`}
                  />
                </div>
              ))}
            </div>
            {errors.giftIdeas && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2 flex items-center"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.giftIdeas}
              </motion.p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Think about what they love, need, or have mentioned wanting
            </p>
          </motion.div>

          {/* Favorite Things */}
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
              <Star className="w-5 h-5 inline mr-2" />
              Their Favorite Things
            </label>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative">
                  <div 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: theme.colors.accent }}
                  >
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={formData.favoriteThings[index]}
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
            <p className="text-xs text-gray-500 mt-2">
              Colors, foods, activities, hobbies, etc.
            </p>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-3xl backdrop-blur-lg border"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderColor: theme.colors.primary + '20'
            }}
          >
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              <Lightbulb className="w-5 h-5 inline mr-2" />
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none h-32"
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: theme.colors.primary + '20'
              }}
              placeholder="Any special notes, memories, or important details about this person..."
            />
            <p className="text-sm text-gray-500 mt-2">
              {formData.notes.length}/300 characters
            </p>
          </motion.div>
        </div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center"
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
    </motion.div>
  );

  const renderUpcomingBirthdays = () => (
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
            <PartyPopper className="w-8 h-8 mr-3" style={{ color: theme.colors.primary }} />
            Upcoming Birthdays
          </h2>
          <p className="text-gray-600">Next 30 days • Plan ahead and show you care</p>
        </div>
      </div>

      {upcomingBirthdays.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <Cake className="w-24 h-24 mx-auto mb-6 text-gray-300" />
          <h3 className="text-2xl font-bold text-gray-600 mb-4">No Upcoming Birthdays</h3>
          <p className="text-gray-500 mb-8">
            No birthdays in the next 30 days. Time to plan for future celebrations!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveView('overview')}
            className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
            style={{ background: theme.gradients.primary }}
          >
            Back to Overview
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {upcomingBirthdays.map((relative, index) => {
            const age = calculateAge(relative.birthday);
            const daysUntil = daysUntilBirthday(relative.birthday);
            const isToday = daysUntil === 0;
            const isSoon = daysUntil <= 7;
            
            return (
              <motion.div
                key={relative.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-3xl backdrop-blur-lg border shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isToday ? 'ring-4 ring-yellow-400' : isSoon ? 'ring-2 ring-orange-300' : ''
                }`}
                style={{
                  background: isToday 
                    ? 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                  borderColor: isToday ? '#ffd700' : theme.colors.primary + '20'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {relative.imageUrl ? (
                      <img
                        src={relative.imageUrl}
                        alt={relative.name}
                        className="w-16 h-16 rounded-full object-cover border-4 shadow-lg"
                        style={{ borderColor: isToday ? '#ffd700' : theme.colors.primary }}
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                        style={{ background: isToday ? '#ffd700' : theme.gradients.primary }}
                      >
                        {relative.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{relative.name}</h3>
                      <p className="text-gray-600">{relative.relationship}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-2">
                          <Cake className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Turning {age + 1}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className={`text-sm font-semibold ${
                            isToday ? 'text-yellow-600' : isSoon ? 'text-orange-600' : 'text-gray-600'
                          }`}>
                            {isToday ? 'Today!' : `${daysUntil} days`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl mb-2">
                      {isToday ? '🎉' : isSoon ? '⏰' : '📅'}
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(relative.birthday).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Gift Ideas */}
                {relative.giftIdeas.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                      <Gift className="w-4 h-4 mr-2" style={{ color: theme.colors.primary }} />
                      Gift Ideas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {relative.giftIdeas.map((idea, idx) => (
                        <div key={idx} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
                          <div 
                            className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: theme.colors.primary }}
                          >
                            {idx + 1}
                          </div>
                          <p className="text-sm text-gray-600">{idea}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex space-x-3 mt-4">
                  {relative.phone && (
                    <a
                      href={`tel:${relative.phone}`}
                      className="flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium text-white transition-colors"
                      style={{ background: theme.colors.primary }}
                    >
                      <Phone className="w-4 h-4 inline mr-2" />
                      Call
                    </a>
                  )}
                  {relative.email && (
                    <a
                      href={`mailto:${relative.email}?subject=Happy Birthday!`}
                      className="flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium text-white transition-colors"
                      style={{ background: theme.colors.accent }}
                    >
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setSelectedRelative(relative);
                      setActiveView('view');
                    }}
                    className="flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium text-white transition-colors"
                    style={{ background: theme.colors.success }}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    View Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );

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
          {activeView === 'upcoming' && renderUpcomingBirthdays()}
        </AnimatePresence>
      </div>
    </div>
  );
};