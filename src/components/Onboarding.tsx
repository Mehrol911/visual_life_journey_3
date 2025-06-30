import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfessionSelector } from './ProfessionSelector';
import { ProfessionTheme } from '../types';
import { Calendar, Sparkles, TreePine, Star, Mail, Lock, Eye, EyeOff, UserPlus, LogIn, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { resendConfirmation } from '../lib/supabase';

interface OnboardingProps {
  onComplete: (data: { profession: ProfessionTheme; birthDate: string; name: string; email: string; password: string }) => void;
  onSwitchToLogin?: () => void;
}

type Step = 'welcome' | 'profession' | 'details' | 'signin' | 'inspiration' | 'email-confirmation';

interface AuthData {
  email: string;
  password: string;
  confirmPassword: string;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSwitchToLogin }) => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [selectedProfession, setSelectedProfession] = useState<ProfessionTheme | null>(null);
  const [dateError, setDateError] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [name, setName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  // Auth state
  const [authData, setAuthData] = useState<AuthData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [authErrors, setAuthErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [resendingConfirmation, setResendingConfirmation] = useState(false);

  const { register, loading, error } = useAuth();

  const handleDateValidation = () => {
    setIsValidating(true);
    
    const today = new Date();
    const inputDate = new Date(birthDate);
    
    // Check if date is valid
    if (isNaN(inputDate.getTime()) || !birthDate) {
      setDateError('Please enter a valid date');
      setIsValidating(false);
      return;
    }

    // Check if date is in the future
    if (inputDate > today) {
      setDateError('Birth date cannot be in the future');
      setIsValidating(false);
      return;
    }

    // Check reasonable age (assuming max 150 years old)
    const minDate = new Date(today.getFullYear() - 150, 0, 1);
    if (inputDate < minDate) {
      setDateError('Please enter a more recent birth date');
      setIsValidating(false);
      return;
    }

    // Check minimum age (at least 1 year old)
    const maxDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    if (inputDate > maxDate) {
      setDateError('You must be at least 1 year old');
      setIsValidating(false);
      return;
    }

    // If all validations pass
    setDateError('');
    setIsValidating(false);
    setCurrentStep('signin');
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleAuthValidation = async () => {
    const errors: {[key: string]: string} = {};

    // Email validation
    if (!authData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(authData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!authData.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(authData.password)) {
      errors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (!authData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (authData.password !== authData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setAuthErrors(errors);

    if (Object.keys(errors).length === 0) {
      setCurrentStep('inspiration');
    }
  };

  const handleComplete = async () => {
    if (selectedProfession && birthDate && name.trim() && authData.email && authData.password) {
      setIsCreatingAccount(true);
      
      try {
        const result = await register(authData.email, authData.password, {
          name: name.trim(),
          birthDate,
          profession: selectedProfession
        });

        if (result.success) {
          // Check if email confirmation is required
          if (result.message && result.message.includes('check your email')) {
            setRegistrationEmail(authData.email);
            setCurrentStep('email-confirmation');
          } else {
            // Call the original onComplete for backward compatibility
            onComplete({
              profession: selectedProfession,
              birthDate,
              name: name.trim(),
              email: authData.email,
              password: authData.password
            });
          }
        } else {
          // Handle registration error
          setAuthErrors({ general: result.error || 'Registration failed' });
          setCurrentStep('signin');
        }
      } catch (err) {
        console.error('Registration error:', err);
        setAuthErrors({ general: 'An unexpected error occurred' });
        setCurrentStep('signin');
      } finally {
        setIsCreatingAccount(false);
      }
    }
  };

  const handleResendConfirmation = async () => {
    if (!registrationEmail) return;
    
    setResendingConfirmation(true);
    try {
      const { error } = await resendConfirmation(registrationEmail);
      if (error) {
        setAuthErrors({ general: error.message });
      } else {
        setAuthErrors({ general: '' });
        // Show success message briefly
        setAuthErrors({ success: 'Confirmation email sent! Please check your inbox.' });
        setTimeout(() => setAuthErrors({ success: '' }), 3000);
      }
    } catch (err) {
      setAuthErrors({ general: 'Failed to resend confirmation email' });
    } finally {
      setResendingConfirmation(false);
    }
  };

  const renderWelcome = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Enhanced floating particles with more variety */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              backgroundColor: ['#60a5fa', '#a78bfa', '#f472b6', '#34d399', '#fbbf24'][Math.floor(Math.random() * 5)],
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              x: [0, Math.random() * 200 - 100, 0],
              y: [0, Math.random() * -200 - 50, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Enhanced gradient orbs with pulsing */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/30 to-orange-500/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto px-8">
        {/* Enhanced main heading with spectacular animations */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="flex items-center justify-center mb-8">
            {/* Animated plant emoji with growth effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="mr-6 text-8xl"
            >
              🌱
            </motion.div>
            
            {/* SPECTACULAR "Intentional" text with multiple effects */}
            <div className="relative">
              {/* Background glow effect */}
              <motion.div
                className="absolute inset-0 text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent blur-sm"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Intentional
              </motion.div>
              
              {/* Main text with letter-by-letter animation */}
              <motion.h1 
                className="relative text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {"Intentional".split("").map((letter, index) => (
                  <motion.span
                    key={index}
                    initial={{ 
                      opacity: 0, 
                      y: 50,
                      rotateX: -90,
                      scale: 0.5
                    }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      rotateX: 0,
                      scale: 1
                    }}
                    transition={{
                      delay: 0.8 + index * 0.1,
                      duration: 0.8,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{
                      scale: 1.2,
                      color: "#fbbf24",
                      textShadow: "0 0 20px rgba(251, 191, 36, 0.8)",
                      transition: { duration: 0.2 }
                    }}
                    className="inline-block cursor-pointer"
                    style={{
                      textShadow: "0 0 30px rgba(59, 130, 246, 0.5)"
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.h1>
              
              {/* Sparkle effects around the text */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            
            {/* Animated rocket emoji with flight path */}
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                x: [0, 10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1
              }}
              className="ml-6 text-8xl"
            >
              🚀
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced glassmorphic quote card */}
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.5, type: "spring" }}
          className="mb-12 p-10 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
          }}
        >
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            animate={{
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 40px rgba(139, 92, 246, 0.4)",
                "0 0 20px rgba(59, 130, 246, 0.3)"
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <blockquote className="text-2xl md:text-3xl font-medium text-white italic mb-6 leading-relaxed">
            "O child of Adam! Each of your days is like a falling leaf from a tree. 
            When one day passes, it's as if a part of your soul has been taken. 
            So spend your life wisely."
          </blockquote>
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-6 h-6 text-yellow-400 mr-3" />
            </motion.div>
            <p className="text-lg text-blue-200 font-semibold">
              — Inspired by Hasan al-Basri
            </p>
            <motion.div
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-6 h-6 text-yellow-400 ml-3" />
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced description */}
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="text-xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto"
        >
          Welcome to a journey of self-discovery and intentional living. 
          Visualize your life as a magnificent tree, where every day is a precious leaf. 
          Make each one count.
        </motion.p>

        {/* Enhanced dual CTA buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          {/* Begin Your Journey Button (Sign Up) */}
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 40px rgba(59, 130, 246, 0.6)",
              y: -5
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentStep('profession')}
            className="relative px-12 py-5 rounded-full text-white font-bold text-xl overflow-hidden group shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
            }}
          >
            {/* Animated background effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100"
              animate={{
                x: ["-100%", "100%"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <span className="relative flex items-center">
              Begin Your Journey
              <motion.span
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="ml-3 text-2xl"
              >
                →
              </motion.span>
            </span>
          </motion.button>

          {/* Sign In Button */}
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 30px rgba(255, 255, 255, 0.3)",
              y: -5
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onSwitchToLogin}
            className="relative px-12 py-5 rounded-full font-bold text-xl overflow-hidden group shadow-2xl border-2 border-white/30 backdrop-blur-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              color: 'white'
            }}
          >
            <span className="relative flex items-center">
              <LogIn className="w-6 h-6 mr-3" />
              Sign In
            </span>
          </motion.button>
        </motion.div>

        {/* Enhanced floating elements with more variety */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 60 + 20 + 'px',
              height: Math.random() * 60 + 20 + 'px',
              background: `linear-gradient(45deg, ${['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'][Math.floor(Math.random() * 5)]}, transparent)`,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, Math.random() * -100 - 50, 0],
              x: [0, Math.random() * 100 - 50, 0],
              rotate: [0, 360],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );

  const renderProfession = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      <ProfessionSelector
        selectedProfession={selectedProfession}
        onSelect={(profession) => {
          setSelectedProfession(profession);
        }}
        onContinue={() => setCurrentStep('details')}
      />
    </motion.div>
  );

  const renderDetails = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 rounded-3xl backdrop-blur-lg border shadow-2xl"
          style={{ 
            background: selectedProfession?.gradients.secondary || 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            borderColor: selectedProfession?.colors.primary + '40',
          }}
        >
          <h2 
            className="text-4xl font-bold mb-8 text-center"
            style={{ color: selectedProfession?.colors.text || '#ffffff' }}
          >
            Tell Us About Yourself
          </h2>

          <div className="space-y-6">
            <div>
              <label 
                className="block text-lg font-medium mb-3"
                style={{ color: selectedProfession?.colors.text || '#e5e7eb' }}
              >
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 backdrop-blur-sm focus:outline-none transition-all duration-300"
                style={{
                  backgroundColor: selectedProfession?.colors.background + '20' || 'rgba(255,255,255,0.1)',
                  borderColor: selectedProfession?.colors.secondary + '60' || 'rgba(255,255,255,0.2)',
                  color: selectedProfession?.colors.text || '#ffffff',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = selectedProfession?.colors.primary || '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = selectedProfession?.colors.secondary + '60' || 'rgba(255,255,255,0.2)';
                }}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label 
                className="block text-lg font-medium mb-3"
                style={{ color: selectedProfession?.colors.text || '#e5e7eb' }}
              >
                Your Birth Date
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setDateError(''); // Clear error when user types
                }}
                min="1900-01-01"
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-6 py-4 rounded-2xl border-2 backdrop-blur-sm focus:outline-none transition-all duration-300"
                style={{
                  backgroundColor: selectedProfession?.colors.background + '20' || 'rgba(255,255,255,0.1)',
                  borderColor: dateError 
                    ? selectedProfession?.colors.error || '#ef4444' 
                    : selectedProfession?.colors.secondary + '60' || 'rgba(255,255,255,0.2)',
                  color: selectedProfession?.colors.text || '#ffffff',
                  colorScheme: 'light'
                }}     
                onFocus={(e) => {
                  if (!dateError) {
                    e.target.style.borderColor = selectedProfession?.colors.primary || '#3b82f6';
                  }
                }}
                onBlur={(e) => {
                  if (!dateError) {
                    e.target.style.borderColor = selectedProfession?.colors.secondary + '60' || 'rgba(255,255,255,0.2)';
                  }
                }}
              />
              {dateError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm mt-2 flex items-center"
                  style={{ color: selectedProfession?.colors.error || '#ef4444' }}
                >
                  ⚠️ {dateError}
                </motion.p>
              )}
              
              <p 
                className="text-sm mt-3"
                style={{ color: selectedProfession?.colors.secondary || '#9ca3af' }}
              >
                This helps us calculate your life tree and visualize your journey
              </p>
            </div>
          </div>

          {name.trim() && birthDate && !dateError && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                boxShadow: `0 0 30px ${selectedProfession?.colors.primary}50`,
                filter: 'brightness(1.1)',
                scale: 1.02,
                boxShadow: `0 8px 32px ${selectedProfession?.colors.primary}40`
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDateValidation}
              disabled={isValidating}
              className="w-full mt-8 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{ 
                background: selectedProfession?.gradients.primary || 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: `0 8px 32px ${selectedProfession?.colors.primary}40`
              }}
            >
              {isValidating ? 'Validating...' : 'Continue to Account Setup'}
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );

  const renderSignIn = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 rounded-3xl backdrop-blur-lg border shadow-2xl"
          style={{ 
            background: selectedProfession?.gradients.secondary || 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            borderColor: selectedProfession?.colors.primary + '40',
          }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: selectedProfession?.gradients.primary }}
            >
              <UserPlus className="w-8 h-8 text-white" />
            </motion.div>
            <h2 
              className="text-4xl font-bold mb-2"
              style={{ color: selectedProfession?.colors.text || '#ffffff' }}
            >
              Create Your Account
            </h2>
            <p 
              className="text-lg"
              style={{ color: selectedProfession?.colors.secondary || '#9ca3af' }}
            >
              Secure your journey with a personal account
            </p>
          </div>

          {/* General Error Display */}
          {(authErrors.general || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl border flex items-center"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderColor: selectedProfession?.colors.error || '#ef4444',
                color: selectedProfession?.colors.error || '#ef4444'
              }}
            >
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="text-sm">{authErrors.general || error}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {authErrors.success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl border flex items-center"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                borderColor: '#22c55e',
                color: '#22c55e'
              }}
            >
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="text-sm">{authErrors.success}</span>
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label 
                className="block text-lg font-medium mb-3"
                style={{ color: selectedProfession?.colors.text || '#e5e7eb' }}
              >
                <Mail className="w-5 h-5 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={authData.email}
                onChange={(e) => {
                  setAuthData(prev => ({ ...prev, email: e.target.value }));
                  if (authErrors.email) {
                    setAuthErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                className="w-full px-6 py-4 rounded-2xl border-2 backdrop-blur-sm focus:outline-none transition-all duration-300"
                style={{
                  backgroundColor: selectedProfession?.colors.background + '20' || 'rgba(255,255,255,0.1)',
                  borderColor: authErrors.email 
                    ? selectedProfession?.colors.error || '#ef4444'
                    : selectedProfession?.colors.secondary + '60' || 'rgba(255,255,255,0.2)',
                  color: selectedProfession?.colors.text || '#ffffff',
                }}
                onFocus={(e) => {
                  if (!authErrors.email) {
                    e.target.style.borderColor = selectedProfession?.colors.primary || '#3b82f6';
                  }
                }}
                onBlur={(e) => {
                  if (!authErrors.email) {
                    e.target.style.borderColor = selectedProfession?.colors.secondary + '60' || 'rgba(255,255,255,0.2)';
                  }
                }}
                placeholder="Enter your email address"
              />
              {authErrors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm mt-2 flex items-center"
                  style={{ color: selectedProfession?.colors.error || '#ef4444' }}
                >
                  ⚠️ {authErrors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label 
                className="block text-lg font-medium mb-3"
                style={{ color: selectedProfession?.colors.text || '#e5e7eb' }}
              >
                <Lock className="w-5 h-5 inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={authData.password}
                  onChange={(e) => {
                    setAuthData(prev => ({ ...prev, password: e.target.value }));
                    if (authErrors.password) {
                      setAuthErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  className="w-full px-6 py-4 pr-14 rounded-2xl border-2 backdrop-blur-sm focus:outline-none transition-all duration-300"
                  style={{
                    backgroundColor: selectedProfession?.colors.background + '20' || 'rgba(255,255,255,0.1)',
                    borderColor: authErrors.password 
                      ? selectedProfession?.colors.error || '#ef4444'
                      : selectedProfession?.colors.secondary + '60' || 'rgba(255,255,255,0.2)',
                    color: selectedProfession?.colors.text || '#ffffff',
                  }}
                  onFocus={(e) => {
                    if (!authErrors.password) {
                      e.target.style.borderColor = selectedProfession?.colors.primary || '#3b82f6';
                    }
                  }}
                  onBlur={(e) => {
                    if (!authErrors.password) {
                      e.target.style.borderColor = selectedProfession?.colors.secondary + '60' || 'rgba(255,255,255,0.2)';
                    }
                  }}
                  placeholder="Create a secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {authErrors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm mt-2 flex items-center"
                  style={{ color: selectedProfession?.colors.error || '#ef4444' }}
                >
                  ⚠️ {authErrors.password}
                </motion.p>
              )}
              <p 
                className="text-sm mt-2"
                style={{ color: selectedProfession?.colors.secondary || '#9ca3af' }}
              >
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label 
                className="block text-lg font-medium mb-3"
                style={{ color: selectedProfession?.colors.text || '#e5e7eb' }}
              >
                <Lock className="w-5 h-5 inline mr-2" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={authData.confirmPassword}
                  onChange={(e) => {
                    setAuthData(prev => ({ ...prev, confirmPassword: e.target.value }));
                    if (authErrors.confirmPassword) {
                      setAuthErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  className="w-full px-6 py-4 pr-14 rounded-2xl border-2 backdrop-blur-sm focus:outline-none transition-all duration-300"
                  style={{
                    backgroundColor: selectedProfession?.colors.background + '20' || 'rgba(255,255,255,0.1)',
                    borderColor: authErrors.confirmPassword 
                      ? selectedProfession?.colors.error || '#ef4444'
                      : selectedProfession?.colors.secondary + '60' || 'rgba(255,255,255,0.2)',
                    color: selectedProfession?.colors.text || '#ffffff',
                  }}
                  onFocus={(e) => {
                    if (!authErrors.confirmPassword) {
                      e.target.style.borderColor = selectedProfession?.colors.primary || '#3b82f6';
                    }
                  }}
                  onBlur={(e) => {
                    if (!authErrors.confirmPassword) {
                      e.target.style.borderColor = selectedProfession?.colors.secondary + '60' || 'rgba(255,255,255,0.2)';
                    }
                  }}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {authErrors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm mt-2 flex items-center"
                  style={{ color: selectedProfession?.colors.error || '#ef4444' }}
                >
                  ⚠️ {authErrors.confirmPassword}
                </motion.p>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 rounded-xl border"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: selectedProfession?.colors.primary + '30'
            }}
          >
            <p 
              className="text-sm text-center"
              style={{ color: selectedProfession?.colors.secondary || '#9ca3af' }}
            >
              🔒 Your data is encrypted and secure. We'll never share your information.
            </p>
          </motion.div>

          {/* Continue Button */}
          {authData.email && authData.password && authData.confirmPassword && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: `0 8px 32px ${selectedProfession?.colors.primary}40`
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAuthValidation}
              disabled={loading}
              className="w-full mt-8 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: selectedProfession?.gradients.primary || 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: `0 8px 32px ${selectedProfession?.colors.primary}40`
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  Creating Account...
                </span>
              ) : (
                <>
                  <LogIn className="w-5 h-5 inline mr-2" />
                  Create Account & Continue
                </>
              )}
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );

  const renderInspiration = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      <div className="max-w-3xl w-full text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 rounded-3xl backdrop-blur-lg border border-white/20 shadow-2xl mb-8"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
            borderColor: selectedProfession?.colors.primary + '40',
          }}
        >
          <h2 className="text-4xl font-bold mb-6 text-white">
            Welcome, {name}
          </h2>
          
          <blockquote className="text-xl font-medium italic mb-6 text-gray-200">
            "{selectedProfession?.quote}"
          </blockquote>
          
          <p className="text-lg mb-6 text-gray-300">
            {selectedProfession?.description}
          </p>

          <p className="text-lg text-gray-300">
            As a {selectedProfession?.name.toLowerCase()}, your journey is unique and meaningful. 
            Every day you have the power to heal, inspire, create, and make a difference. 
            Let's make each day count.
          </p>
        </motion.div>

        <motion.button
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleComplete}
          disabled={isCreatingAccount || loading}
          className="px-12 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          style={{ background: selectedProfession?.gradients.primary || 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
        >
          {isCreatingAccount || loading ? (
            <span className="flex items-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
              Creating Your Life Tree...
            </span>
          ) : (
            'Enter Your Life Tree'
          )}
        </motion.button>
      </div>
    </motion.div>
  );

  const renderEmailConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 rounded-3xl backdrop-blur-lg border shadow-2xl text-center"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
            borderColor: selectedProfession?.colors.primary + '40',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: selectedProfession?.gradients.primary }}
          >
            <Mail className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-4xl font-bold mb-4 text-white">
            Check Your Email
          </h2>
          
          <p className="text-xl text-gray-300 mb-6">
            We've sent a confirmation link to:
          </p>
          
          <div className="p-4 rounded-xl border mb-6"
               style={{
                 background: 'rgba(255,255,255,0.1)',
                 borderColor: selectedProfession?.colors.primary + '30'
               }}>
            <p className="text-lg font-semibold text-white">{registrationEmail}</p>
          </div>

          <p className="text-gray-300 mb-8 leading-relaxed">
            Please click the confirmation link in your email to complete your registration. 
            Once confirmed, you can sign in and start your Life Tree journey.
          </p>

          {/* Error Display */}
          {authErrors.general && (
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
              <span className="text-sm">{authErrors.general}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {authErrors.success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl border flex items-center"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                borderColor: '#22c55e',
                color: '#22c55e'
              }}
            >
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="text-sm">{authErrors.success}</span>
            </motion.div>
          )}

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleResendConfirmation}
              disabled={resendingConfirmation}
              className="w-full px-6 py-3 rounded-xl border-2 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderColor: selectedProfession?.colors.primary + '40'
              }}
            >
              {resendingConfirmation ? (
                <span className="flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  Resending...
                </span>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 inline mr-2" />
                  Resend Confirmation Email
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSwitchToLogin}
              className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300"
              style={{ background: selectedProfession?.gradients.primary }}
            >
              <LogIn className="w-5 h-5 inline mr-2" />
              Go to Sign In
            </motion.button>
          </div>

          <p className="text-sm text-gray-400 mt-6">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {currentStep === 'welcome' && renderWelcome()}
        {currentStep === 'profession' && renderProfession()}
        {currentStep === 'details' && renderDetails()}
        {currentStep === 'signin' && renderSignIn()}
        {currentStep === 'inspiration' && renderInspiration()}
        {currentStep === 'email-confirmation' && renderEmailConfirmation()}
      </AnimatePresence>
    </div>
  );
};