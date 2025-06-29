import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeStats, ProfessionTheme } from '../types';
import { Calendar, Pause, Play, RotateCcw, Settings, Sparkles, Info } from 'lucide-react';

interface FallingLeaf {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  fallSpeed: number;
  swayAmplitude: number;
  swayFrequency: number;
  opacity: number;
  dayNumber: number;
  date: Date;
  lifePhase: string;
}

interface LifePhase {
  name: string;
  color: string;
  ageRange: string;
  startAge: number;
  endAge: number;
  description: string;
}

interface FallingLeafAnimationProps {
  lifeStats: LifeStats;
  theme: ProfessionTheme;
  userBirthDate: string;
}

export const FallingLeafAnimation: React.FC<FallingLeafAnimationProps> = ({
  lifeStats,
  theme,
  userBirthDate
}) => {
  const [leaves, setLeaves] = useState<FallingLeaf[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentDay, setCurrentDay] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [leafCount, setLeafCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastDropTime = useRef(0);

  // Define life phases based on actual age ranges
  const lifePhases: LifePhase[] = [
    {
      name: 'Infancy',
      color: '#98FB98', // Light green
      ageRange: '0-2 years',
      startAge: 0,
      endAge: 2,
      description: 'First steps and words'
    },
    {
      name: 'Early Childhood',
      color: '#90EE90', // Light green
      ageRange: '3-5 years',
      startAge: 3,
      endAge: 5,
      description: 'Learning and playing'
    },
    {
      name: 'Childhood',
      color: '#32CD32', // Lime green
      ageRange: '6-12 years',
      startAge: 6,
      endAge: 12,
      description: 'School and friendships'
    },
    {
      name: 'Adolescence',
      color: '#9ACD32', // Yellow green
      ageRange: '13-17 years',
      startAge: 13,
      endAge: 17,
      description: 'Growth and discovery'
    },
    {
      name: 'Young Adult',
      color: '#FFD700', // Gold
      ageRange: '18-25 years',
      startAge: 18,
      endAge: 25,
      description: 'Independence and exploration'
    },
    {
      name: 'Adult',
      color: '#FFA500', // Orange
      ageRange: '26-40 years',
      startAge: 26,
      endAge: 40,
      description: 'Career and relationships'
    },
    {
      name: 'Middle Age',
      color: '#FF8C00', // Dark orange
      ageRange: '41-60 years',
      startAge: 41,
      endAge: 60,
      description: 'Wisdom and leadership'
    },
    {
      name: 'Senior',
      color: '#CD853F', // Peru
      ageRange: '61-75 years',
      startAge: 61,
      endAge: 75,
      description: 'Experience and mentoring'
    },
    {
      name: 'Elder',
      color: '#8B4513', // Saddle brown
      ageRange: '76+ years',
      startAge: 76,
      endAge: 120,
      description: 'Legacy and reflection'
    }
  ];

  // Calculate exact days lived
  const calculateDaysLived = () => {
    const birthDate = new Date(userBirthDate);
    const today = new Date();
    const timeDiff = today.getTime() - birthDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  };

  const totalDaysLived = calculateDaysLived();
  const currentAge = lifeStats.current_age;

  // Get age-appropriate life phases (only phases the user has experienced or is currently in)
  const getApplicableLifePhases = (): LifePhase[] => {
    return lifePhases.filter(phase => phase.startAge <= currentAge);
  };

  const applicablePhases = getApplicableLifePhases();

  // Get life phase for a specific age
  const getLifePhaseForAge = (age: number): LifePhase => {
    // Only return phases that are age-appropriate
    const phase = applicablePhases.find(p => age >= p.startAge && age <= p.endAge);
    return phase || applicablePhases[applicablePhases.length - 1]; // Default to current highest phase
  };

  // Get age from day number
  const getAgeFromDay = (dayNumber: number): number => {
    return Math.floor(dayNumber / 365.25);
  };

  // Get leaf color based on age-appropriate life phase
  const getLeafColor = (dayNumber: number): string => {
    const age = getAgeFromDay(dayNumber);
    const phase = getLifePhaseForAge(age);
    return phase.color;
  };

  // Get life phase name for a day
  const getLifePhaseName = (dayNumber: number): string => {
    const age = getAgeFromDay(dayNumber);
    const phase = getLifePhaseForAge(age);
    return phase.name;
  };

  // Get date for a specific day number
  const getDateForDay = (dayNumber: number) => {
    const birthDate = new Date(userBirthDate);
    const targetDate = new Date(birthDate);
    targetDate.setDate(birthDate.getDate() + dayNumber);
    return targetDate;
  };

  // Create a new falling leaf
  const createLeaf = (dayNumber: number): FallingLeaf => {
    const containerWidth = containerRef.current?.clientWidth || 800;
    const age = getAgeFromDay(dayNumber);
    const phase = getLifePhaseForAge(age);
    
    return {
      id: `leaf-${dayNumber}-${Date.now()}`,
      x: Math.random() * (containerWidth - 60) + 30,
      y: -50,
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4,
      color: phase.color,
      fallSpeed: 1 + Math.random() * 2,
      swayAmplitude: 20 + Math.random() * 30,
      swayFrequency: 0.02 + Math.random() * 0.03,
      opacity: 0.8 + Math.random() * 0.2,
      dayNumber,
      date: getDateForDay(dayNumber),
      lifePhase: phase.name
    };
  };

  // Animation loop
  const animate = (timestamp: number) => {
    if (!isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // Drop new leaf based on speed
    const dropInterval = Math.max(50, 1000 / animationSpeed);
    
    if (timestamp - lastDropTime.current > dropInterval && currentDay < totalDaysLived) {
      const newLeaf = createLeaf(currentDay + 1);
      setLeaves(prev => [...prev, newLeaf]);
      setCurrentDay(prev => prev + 1);
      setLeafCount(prev => prev + 1);
      lastDropTime.current = timestamp;
    }

    // Update leaf positions
    setLeaves(prev => prev.map(leaf => {
      const newY = leaf.y + leaf.fallSpeed * animationSpeed;
      const sway = Math.sin(timestamp * leaf.swayFrequency) * leaf.swayAmplitude;
      const newX = leaf.x + sway * 0.1;
      const newRotation = leaf.rotation + 1 * animationSpeed;

      return {
        ...leaf,
        x: newX,
        y: newY,
        rotation: newRotation
      };
    }).filter(leaf => leaf.y < (containerRef.current?.clientHeight || 600) + 100));

    animationRef.current = requestAnimationFrame(animate);
  };

  // Start animation
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animationSpeed, currentDay, totalDaysLived]);

  // Reset animation
  const resetAnimation = () => {
    setLeaves([]);
    setCurrentDay(0);
    setLeafCount(0);
    lastDropTime.current = 0;
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Get current life phase
  const getCurrentLifePhase = (): LifePhase => {
    return getLifePhaseForAge(currentAge);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, 
            ${theme.colors.primary}20 0%, 
            ${theme.colors.secondary}15 50%, 
            ${theme.colors.accent}10 100%)`
        }}
      />

      {/* Falling Leaves Container */}
      <div ref={containerRef} className="absolute inset-0">
        <AnimatePresence>
          {leaves.map((leaf) => (
            <motion.div
              key={leaf.id}
              className="absolute pointer-events-none"
              style={{
                left: leaf.x,
                top: leaf.y,
                transform: `rotate(${leaf.rotation}deg) scale(${leaf.scale})`,
                opacity: leaf.opacity
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: leaf.opacity, scale: leaf.scale }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Enhanced Leaf SVG with better design */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <defs>
                  <radialGradient id={`leafGradient-${leaf.id}`} cx="0.3" cy="0.3" r="0.8">
                    <stop offset="0%" stopColor={leaf.color} stopOpacity="1" />
                    <stop offset="70%" stopColor={leaf.color} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={leaf.color} stopOpacity="0.7" />
                  </radialGradient>
                </defs>
                <path
                  d="M14 3C14 3 9 8 9 15C9 20 11.5 22 14 22C16.5 22 19 20 19 15C19 8 14 3 14 3Z"
                  fill={`url(#leafGradient-${leaf.id})`}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.5"
                />
                <path
                  d="M14 7L14 22"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="1"
                />
                <path
                  d="M14 10L17 13"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.5"
                />
                <path
                  d="M14 14L11 17"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.5"
                />
              </svg>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Enhanced Stats Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 z-10 p-6 rounded-3xl backdrop-blur-lg border shadow-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
          borderColor: theme.colors.primary + '20'
        }}
      >
        <div className="flex items-center mb-4">
          <Sparkles className="w-6 h-6 mr-3" style={{ color: theme.colors.primary }} />
          <h2 className="text-2xl font-bold text-gray-800">Life Journey</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center min-w-[280px]">
            <span className="text-sm font-semibold text-gray-600">Days Lived:</span>
            <span className="text-xl font-bold" style={{ color: theme.colors.primary }}>
              {leafCount.toLocaleString()} / {totalDaysLived.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600">Current Age:</span>
            <span className="text-lg font-bold text-gray-800">
              {lifeStats.current_age} years
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600">Current Phase:</span>
            <span className="text-sm font-bold px-3 py-1 rounded-full text-white" 
                  style={{ backgroundColor: getCurrentLifePhase().color }}>
              {getCurrentLifePhase().name}
            </span>
          </div>
          
          {currentDay > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Animation Phase:</span>
              <span className="text-sm font-bold" style={{ color: theme.colors.accent }}>
                {getLifePhaseName(currentDay)}
              </span>
            </div>
          )}
          
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <motion.div
              className="h-3 rounded-full"
              style={{ 
                background: theme.gradients.primary,
                width: `${(leafCount / totalDaysLived) * 100}%`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(leafCount / totalDaysLived) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            {((leafCount / totalDaysLived) * 100).toFixed(2)}% Complete
          </div>
        </div>
      </motion.div>

      {/* Current Date Display */}
      {currentDay > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-6 right-6 z-10 p-4 rounded-2xl backdrop-blur-lg border shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
            borderColor: theme.colors.primary + '20'
          }}
        >
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5" style={{ color: theme.colors.primary }} />
            <div className="text-center">
              <div className="text-sm font-bold text-gray-800">
                Day {currentDay.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">
                {getDateForDay(currentDay).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="text-xs font-semibold mt-1" 
                   style={{ color: getLeafColor(currentDay) }}>
                Age {getAgeFromDay(currentDay)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="absolute bottom-24 right-6 z-10 flex gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlayPause}
          className="p-3 rounded-full backdrop-blur-lg border shadow-lg transition-colors"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
            borderColor: theme.colors.primary + '40'
          }}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" style={{ color: theme.colors.primary }} />
          ) : (
            <Play className="w-5 h-5" style={{ color: theme.colors.primary }} />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={resetAnimation}
          className="p-3 rounded-full backdrop-blur-lg border shadow-lg transition-colors"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
            borderColor: theme.colors.primary + '40'
          }}
        >
          <RotateCcw className="w-5 h-5" style={{ color: theme.colors.primary }} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 rounded-full backdrop-blur-lg border shadow-lg transition-colors"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
            borderColor: theme.colors.primary + '40'
          }}
        >
          <Settings className="w-5 h-5" style={{ color: theme.colors.primary }} />
        </motion.button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-24 right-6 z-10 p-6 rounded-2xl backdrop-blur-lg border shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              borderColor: theme.colors.primary + '20',
              width: '280px'
            }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Animation Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Animation Speed: {animationSpeed}x
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${theme.colors.primary} 0%, ${theme.colors.primary} ${(animationSpeed / 10) * 100}%, #e5e7eb ${(animationSpeed / 10) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Age-Appropriate Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-6 z-10 p-4 rounded-2xl backdrop-blur-lg border shadow-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
          borderColor: theme.colors.primary + '20'
        }}
      >
        <div className="flex items-center mb-3">
          <Info className="w-4 h-4 mr-2" style={{ color: theme.colors.primary }} />
          <h4 className="text-sm font-bold text-gray-800">Your Life Phases</h4>
        </div>
        <div className="space-y-2">
          {applicablePhases.map((phase, index) => (
            <div key={phase.name} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300" 
                style={{ backgroundColor: phase.color }}
              ></div>
              <span className="text-xs text-gray-600">
                {phase.name} ({phase.ageRange})
              </span>
              {phase.startAge <= currentAge && currentAge <= phase.endAge && (
                <span className="text-xs font-bold text-green-600">Current</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Only showing phases you've experienced (age {currentAge})
          </p>
        </div>
      </motion.div>

      {/* Completion Message */}
      {currentDay >= totalDaysLived && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm"
        >
          <div className="text-center p-8 rounded-3xl backdrop-blur-lg border shadow-2xl"
               style={{
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                 borderColor: theme.colors.primary + '40'
               }}>
            <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.primary }} />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Journey Complete!</h2>
            <p className="text-lg text-gray-600 mb-2">
              You've witnessed all {totalDaysLived.toLocaleString()} days of your life journey
            </p>
            <p className="text-md text-gray-500 mb-6">
              From {applicablePhases[0]?.name} to {getCurrentLifePhase().name}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetAnimation}
              className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
              style={{ background: theme.gradients.primary }}
            >
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Watch Again
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};