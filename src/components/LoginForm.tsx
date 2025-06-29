import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const { login, loading, error } = useAuth();

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await login(email, password);
    
    if (!result.success) {
      setFormErrors({ general: result.error || 'Login failed' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      <div className="max-w-md w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 rounded-3xl backdrop-blur-lg border shadow-2xl"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            borderColor: 'rgba(59, 130, 246, 0.4)',
          }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <LogIn className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-4xl font-bold mb-2 text-white">
              Welcome Back
            </h2>
            <p className="text-lg text-gray-300">
              Continue your life journey
            </p>
          </div>

          {/* General Error Display */}
          {(formErrors.general || error) && (
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
              <span className="text-sm">{formErrors.general || error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-lg font-medium mb-3 text-white">
                <Mail className="w-5 h-5 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) {
                    setFormErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                className="w-full px-6 py-4 rounded-2xl border-2 backdrop-blur-sm focus:outline-none transition-all duration-300 text-white"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: formErrors.email ? '#ef4444' : 'rgba(255,255,255,0.2)',
                }}
                onFocus={(e) => {
                  if (!formErrors.email) {
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
                onBlur={(e) => {
                  if (!formErrors.email) {
                    e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  }
                }}
                placeholder="Enter your email address"
              />
              {formErrors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm mt-2 flex items-center text-red-400"
                >
                  ⚠️ {formErrors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-lg font-medium mb-3 text-white">
                <Lock className="w-5 h-5 inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) {
                      setFormErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  className="w-full px-6 py-4 pr-14 rounded-2xl border-2 backdrop-blur-sm focus:outline-none transition-all duration-300 text-white"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: formErrors.password ? '#ef4444' : 'rgba(255,255,255,0.2)',
                  }}
                  onFocus={(e) => {
                    if (!formErrors.password) {
                      e.target.style.borderColor = '#3b82f6';
                    }
                  }}
                  onBlur={(e) => {
                    if (!formErrors.password) {
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                    }
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm mt-2 flex items-center text-red-400"
                >
                  ⚠️ {formErrors.password}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)'
              }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full mt-8 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  Signing In...
                </span>
              ) : (
                <>
                  <LogIn className="w-5 h-5 inline mr-2" />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          {/* Switch to Register */}
          <div className="mt-8 text-center">
            <p className="text-gray-300 mb-4">Don't have an account?</p>
            <button
              onClick={onSwitchToRegister}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Create your Life Tree →
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};