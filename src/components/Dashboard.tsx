import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LifeTree3D } from './LifeTree3D';
import { DailyReflection } from './DailyReflection';
import { WorldMap } from './WorldMap';
import { MyLibrary } from './MyLibrary';
import { Workouts } from './Workouts';
import { Relatives } from './Relatives';
import { ProfileSettings } from './ProfileSettings';
import { FallingLeafAnimation } from './FallingLeafAnimation';
import { User, LifeStats } from '../types';
import { calculateLifeStats } from '../utils/lifeCalculations';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Settings,
  Heart,
  Map,
  Camera,
  Sparkles,
  LogOut,
  Library,
  Award,
  Dumbbell,
  Users,
  User as UserIcon,
  Leaf
} from 'lucide-react';

interface DashboardProps {
  user: User;
  lifeStats: LifeStats;
  onLogout: () => void;
}

type ActiveView = 'tree' | 'reflection' | 'library' | 'heroes' | 'workouts' | 'relatives' | 'travel' | 'timeline' | 'analytics' | 'profile' | 'falling-leaves';

export const Dashboard: React.FC<DashboardProps> = ({ user: initialUser, lifeStats: initialLifeStats, onLogout }) => {
  const [activeView, setActiveView] = useState<ActiveView>('tree');
  const [user, setUser] = useState(initialUser);
  const [lifeStats, setLifeStats] = useState(initialLifeStats);

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    // Recalculate life stats with new birth date
    const newLifeStats = calculateLifeStats(updatedUser.birth_date);
    setLifeStats(newLifeStats);
  };

  const navigationItems = [
    { id: 'tree', label: 'Life Tree', icon: Home, description: 'Visualize your journey' },
    { id: 'falling-leaves', label: 'Falling Leaves', icon: Leaf, description: 'Days of your life' },
    { id: 'reflection', label: 'Daily Reflection', icon: BookOpen, description: 'Today\'s thoughts' },
    { id: 'library', label: 'My Library', icon: Library, description: 'Books & Heroes' },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell, description: 'Fitness journey' },
    { id: 'relatives', label: 'Relatives', icon: Users, description: 'Family & friends' },
    { id: 'travel', label: 'World Map', icon: Map, description: 'Places visited' },
    { id: 'timeline', label: 'Timeline', icon: Camera, description: 'Life memories' },
    { id: 'analytics', label: 'Insights', icon: TrendingUp, description: 'AI insights' },
    { id: 'profile', label: 'Profile', icon: UserIcon, description: 'Account settings' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'tree':
        return <LifeTree3D lifeStats={lifeStats} theme={user.profession.theme} />;
      case 'falling-leaves':
        return <FallingLeafAnimation lifeStats={lifeStats} theme={user.profession.theme} userBirthDate={user.birth_date} />;
      case 'reflection':
        return <DailyReflection theme={user.profession.theme} userBirthDate={user.birth_date} />;
      case 'library':
        return <MyLibrary theme={user.profession.theme} />;
      case 'workouts':
        return <Workouts theme={user.profession.theme} userBirthDate={user.birth_date} />;
      case 'relatives':
        return <Relatives theme={user.profession.theme} />;
      case 'travel':
        return <WorldMap theme={user.profession.theme} />;
      case 'profile':
        return (
          <ProfileSettings 
            user={user} 
            onBack={() => setActiveView('tree')}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full relative">
            {/* Background effects */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
            
            <div className="text-center p-12 relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: user.profession.theme.gradients.primary }}
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {navigationItems.find(item => item.id === activeView)?.label}
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                This amazing feature is coming soon! 
              </p>
              <p className="text-gray-500">
                For now, explore your Life Tree, Falling Leaves, Daily Reflections, My Library, Workouts, Relatives, and Profile to start your journey.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Animated Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)`
        }}
      >
        {/* Subtle professional pattern overlay */}
        <div 
          className="absolute inset-0 opacity-3"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #64748b 1px, transparent 1px), radial-gradient(circle at 75% 75%, #475569 0.5px, transparent 0.5px)`,
            backgroundSize: '60px 60px, 40px 40px'
          }}
        />
        
        {/* Subtle accent elements */}
        <div 
          className="absolute top-20 left-20 w-32 h-32 rounded-full blur-2xl opacity-20"
          style={{
            background: `radial-gradient(circle, ${user.profession.theme.colors.primary}40 0%, transparent 70%)`
          }}
        />
        <div 
          className="absolute bottom-32 right-32 w-24 h-24 rounded-full blur-xl opacity-15"
          style={{
            background: `radial-gradient(circle, ${user.profession.theme.colors.accent}50 0%, transparent 70%)`
          }}
        />
        
        {/* Minimal floating elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: '2px',
              height: '2px',
              backgroundColor: '#64748b'
            }}
            animate={{
              x: [0, Math.random() * 50 - 25, 0],
              y: [0, Math.random() * -30 - 10, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      {/* Glassmorphic Sidebar - Only show if not in profile view */}
      {activeView !== 'profile' && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 p-6 backdrop-blur-lg border-r border-white/10 relative z-10 flex flex-col"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
            borderRight: `1px solid ${user.profession.theme.colors.primary}20`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          {/* Header */}
          <div className="mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="flex items-center mb-4"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                style={{ background: user.profession.theme.gradients.primary }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Intentional
                </h1>
                <p className="text-sm text-gray-600">
                  {user.profession.theme.name} Journey
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-2xl border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.6) 100%)',
                borderColor: user.profession.theme.colors.primary + '30',
                boxShadow: `0 4px 20px ${user.profession.theme.colors.primary}15`
              }}
            >
              <p className="text-gray-700 font-medium mb-1">Welcome back,</p>
              <p className="text-2xl font-bold mb-2" style={{ color: user.profession.theme.colors.primary }}>
                {user.full_name}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {lifeStats.life_percentage.toFixed(1)}% of your journey completed • {user.profession.theme.name}
              </p>
            </motion.div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto space-y-2 mb-8">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ 
                    scale: 1.02, 
                    x: 4,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveView(item.id as ActiveView)}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-4 rounded-2xl
                    transition-all duration-300 text-left group relative overflow-hidden
                    ${isActive 
                      ? 'shadow-lg transform scale-105' 
                      : 'hover:shadow-md opacity-75 hover:opacity-100'
                    }
                  `}
                  style={{
                    background: isActive 
                      ? user.profession.theme.gradients.primary
                      : 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(248,250,252,0.5) 100%)',
                    borderColor: isActive ? 'transparent' : user.profession.theme.colors.primary + '20',
                    border: isActive ? 'none' : `1px solid ${user.profession.theme.colors.primary}20`
                  }}
                >
                  {/* Glow effect */}
                  {isActive && (
                    <div 
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        boxShadow: `0 0 30px ${user.profession.theme.colors.primary}40`
                      }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center space-x-4 w-full">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                      ${isActive 
                        ? 'bg-white/30 shadow-lg' 
                        : 'bg-white/60 group-hover:bg-white/80'
                      }
                    `}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-700'}`} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${isActive ? 'text-white' : 'text-gray-800'}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-600'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </nav>

          {/* Life Stats Summary */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-2xl border border-white/10 mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.6) 100%)',
              borderColor: user.profession.theme.colors.primary + '25',
              boxShadow: `0 4px 15px ${user.profession.theme.colors.primary}10`
            }}
          >
            <h3 className="text-gray-800 font-semibold mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Life Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Age</span>
                <span className="text-gray-800 font-semibold">{lifeStats.current_age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Days Lived</span>
                <span className="text-gray-800 font-semibold">{lifeStats.days_lived.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ background: user.profession.theme.gradients.primary }}
                  initial={{ width: 0 }}
                  animate={{ width: `${lifeStats.life_percentage}%` }}
                  transition={{ duration: 2, delay: 1 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Logout Button */}
          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl opacity-75 hover:opacity-100 transition-all duration-300 border border-white/10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(248,250,252,0.4) 100%)',
              borderColor: user.profession.theme.colors.primary + '20'
            }}
          >
            <LogOut className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Sign Out</span>
          </motion.button>
        </motion.div>
      )}

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 relative z-10 overflow-hidden">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="h-full overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: `${user.profession.theme.colors.primary}40 transparent`
          }}
        >
          {/* Custom scrollbar styles */}
          <style jsx>{`
            .h-full::-webkit-scrollbar {
              width: 8px;
            }
            .h-full::-webkit-scrollbar-track {
              background: rgba(0,0,0,0.1);
              border-radius: 4px;
            }
            .h-full::-webkit-scrollbar-thumb {
              background: ${user.profession.theme.colors.primary}60;
              border-radius: 4px;
            }
            .h-full::-webkit-scrollbar-thumb:hover {
              background: ${user.profession.theme.colors.primary}80;
            }
          `}</style>
          
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};