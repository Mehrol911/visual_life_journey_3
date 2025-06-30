import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Briefcase, 
  Save, 
  Sparkles, 
  Settings,
  ChevronDown,
  Check,
  AlertCircle,
  Loader
} from 'lucide-react';
import { ProfessionTheme, User as UserType } from '../types';
import { PROFESSIONS } from '../data/professions';
import { useAuth } from '../hooks/useAuth';
import { userPreferencesAPI } from '../lib/database';

interface ProfileSettingsProps {
  user: UserType;
  onBack: () => void;
  onProfileUpdate: (updatedUser: UserType) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ 
  user, 
  onBack, 
  onProfileUpdate 
}) => {
  const { updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user.full_name,
    birthDate: user.birth_date,
    profession: user.profession.theme
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes
  useEffect(() => {
    const hasNameChange = formData.fullName !== user.full_name;
    const hasDateChange = formData.birthDate !== user.birth_date;
    const hasProfessionChange = formData.profession.name !== user.profession.theme.name;
    
    setHasChanges(hasNameChange || hasDateChange || hasProfessionChange);
  }, [formData, user]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    // Birth date validation
    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const minDate = new Date('1900-01-01');
      
      if (birthDate > today) {
        newErrors.birthDate = 'Birth date cannot be in the future';
      } else if (birthDate < minDate) {
        newErrors.birthDate = 'Please enter a valid birth date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !hasChanges) return;

    setIsSubmitting(true);
    
    try {
      // Update user profile in Supabase Auth
      const result = await updateProfile({
        fullName: formData.fullName.trim(),
        birthDate: formData.birthDate,
        profession: formData.profession
      });

      if (result.success) {
        // Create updated user object
        const updatedUser: UserType = {
          ...user,
          full_name: formData.fullName.trim(),
          birth_date: formData.birthDate,
          profession: {
            ...user.profession,
            theme: formData.profession
          }
        };

        // Also save preferences to database
        await userPreferencesAPI.upsert({
          theme: formData.profession.name,
          birthDate: formData.birthDate,
          fullName: formData.fullName.trim()
        });

        onProfileUpdate(updatedUser);
        setHasChanges(false);
      } else {
        setErrors({ general: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectProfession = (profession: ProfessionTheme) => {
    setFormData(prev => ({ ...prev, profession }));
    setShowProfessionDropdown(false);
  };

  const currentTheme = formData.profession;

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
            background: `radial-gradient(circle, ${currentTheme.colors.primary}60 0%, transparent 70%)`
          }}
        />
        <div 
          className="absolute bottom-32 left-32 w-24 h-24 rounded-full blur-xl opacity-10"
          style={{
            background: `radial-gradient(circle, ${currentTheme.colors.accent}50 0%, transparent 70%)`
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-3 rounded-xl border mr-4 transition-all duration-300"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderColor: currentTheme.colors.primary + '20'
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
              style={{ background: currentTheme.gradients.primary }}
            >
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Profile Settings</h1>
              <p className="text-gray-600">Update your personal information and preferences</p>
            </div>
          </div>
        </motion.div>

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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div 
              className="p-8 rounded-3xl backdrop-blur-lg border shadow-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                borderColor: currentTheme.colors.primary + '20'
              }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="w-6 h-6 mr-3" style={{ color: currentTheme.colors.primary }} />
                Personal Information
              </h2>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, fullName: e.target.value }));
                      if (errors.fullName) {
                        setErrors(prev => ({ ...prev, fullName: '' }));
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderColor: errors.fullName ? '#ef4444' : currentTheme.colors.primary + '20'
                    }}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.fullName}
                    </motion.p>
                  )}
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, birthDate: e.target.value }));
                      if (errors.birthDate) {
                        setErrors(prev => ({ ...prev, birthDate: '' }));
                      }
                    }}
                    min="1900-01-01"
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderColor: errors.birthDate ? '#ef4444' : currentTheme.colors.primary + '20'
                    }}
                  />
                  {errors.birthDate && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-2 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.birthDate}
                    </motion.p>
                  )}
                </div>
              </div>
            </div>

            {/* Current Profile Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-6 rounded-3xl border"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.colors.primary}10 0%, ${currentTheme.colors.accent}10 100%)`,
                borderColor: currentTheme.colors.primary + '30'
              }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" style={{ color: currentTheme.colors.primary }} />
                Current Profile
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-gray-800">{formData.fullName || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Birth Date:</span>
                  <span className="font-semibold text-gray-800">
                    {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profession:</span>
                  <span className="font-semibold" style={{ color: currentTheme.colors.primary }}>
                    {formData.profession.name}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Profession & Theme */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div 
              className="p-8 rounded-3xl backdrop-blur-lg border shadow-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                borderColor: currentTheme.colors.primary + '20'
              }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Briefcase className="w-6 h-6 mr-3" style={{ color: currentTheme.colors.primary }} />
                Profession & Theme
              </h2>

              <div className="space-y-6">
                {/* Profession Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Your Profession
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowProfessionDropdown(!showProfessionDropdown)}
                      className="w-full px-4 py-4 rounded-xl border-2 text-left flex items-center justify-between transition-all duration-300 focus:outline-none"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderColor: currentTheme.colors.primary + '40'
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                          style={{ background: currentTheme.gradients.primary }}
                        >
                          {currentTheme.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-800">{currentTheme.name}</span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <AnimatePresence>
                      {showProfessionDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-20 w-full mt-2 bg-white rounded-xl border shadow-lg max-h-80 overflow-y-auto"
                          style={{ borderColor: currentTheme.colors.primary + '20' }}
                        >
                          {PROFESSIONS.map((profession) => (
                            <button
                              key={profession.name}
                              onClick={() => selectProfession(profession)}
                              className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                            >
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                style={{ background: profession.gradients.primary }}
                              >
                                {profession.name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800">{profession.name}</div>
                                <div className="text-sm text-gray-500 line-clamp-1">
                                  {profession.description.split(',')[0]}
                                </div>
                              </div>
                              {currentTheme.name === profession.name && (
                                <Check className="w-5 h-5" style={{ color: profession.colors.primary }} />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Theme Preview */}
                <motion.div
                  key={currentTheme.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl border"
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme.colors.primary}08 0%, ${currentTheme.colors.accent}08 100%)`,
                    borderColor: currentTheme.colors.primary + '20'
                  }}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{currentTheme.name}</h3>
                  
                  <blockquote className="text-lg italic text-gray-700 mb-4 leading-relaxed">
                    "{currentTheme.quote}"
                  </blockquote>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {currentTheme.description}
                  </p>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-600">Theme Colors:</span>
                    <div className="flex space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: currentTheme.colors.primary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: currentTheme.colors.secondary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: currentTheme.colors.accent }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <motion.button
            whileHover={{ 
              scale: hasChanges ? 1.05 : 1,
              boxShadow: hasChanges ? `0 0 30px ${currentTheme.colors.primary}50` : 'none'
            }}
            whileTap={{ scale: hasChanges ? 0.95 : 1 }}
            onClick={handleSave}
            disabled={!hasChanges || isSubmitting}
            className="px-12 py-4 rounded-full text-white font-semibold text-lg relative overflow-hidden group shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            style={{ 
              background: hasChanges ? currentTheme.gradients.primary : '#9ca3af',
              boxShadow: hasChanges ? `0 4px 20px ${currentTheme.colors.primary}40` : 'none'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center">
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-3" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-3" />
                  {hasChanges ? 'Save Changes' : 'No Changes to Save'}
                  <Sparkles className="w-5 h-5 ml-3" />
                </>
              )}
            </span>
          </motion.button>
          
          {hasChanges && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-600 mt-3"
            >
              You have unsaved changes
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
};