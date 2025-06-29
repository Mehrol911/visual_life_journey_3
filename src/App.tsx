import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Onboarding } from './components/Onboarding';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { ProfessionTheme, User } from './types';
import { calculateLifeStats } from './utils/lifeCalculations';
import { useAuth } from './hooks/useAuth';

interface OnboardingData {
  profession: ProfessionTheme;
  birthDate: string;
  name: string;
  email: string;
  password: string;
}

type AppView = 'onboarding' | 'login' | 'dashboard';

function App() {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('onboarding');

  // Determine view based on auth state
  useEffect(() => {
    if (!loading) {
      if (user) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('onboarding');
      }
    }
  }, [user, loading]);

  const handleOnboardingComplete = (data: OnboardingData) => {
    // The user will be automatically set by the auth hook after successful registration
    setCurrentView('dashboard');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('onboarding');
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView('onboarding');
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-white text-lg">Loading your Life Tree...</p>
        </motion.div>
      </div>
    );
  }

  const lifeStats = user ? calculateLifeStats(user.birth_date) : null;

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {currentView === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Onboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        )}
        
        {currentView === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoginForm onSwitchToRegister={handleSwitchToRegister} />
          </motion.div>
        )}
        
        {currentView === 'dashboard' && user && lifeStats && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Dashboard 
              user={user} 
              lifeStats={lifeStats}
              onLogout={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Built with Bolt.new Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          Built with ⚡ Bolt.new
        </div>
      </motion.div>
    </div>
  );
}

export default App;