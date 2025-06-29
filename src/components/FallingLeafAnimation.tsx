import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeStats, ProfessionTheme } from '../types';
import { Calendar, Pause, Play, RotateCcw, Settings, Sparkles } from 'lucide-react';

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

  // Calculate exact days lived
  const calculateDaysLived = () => {
    const birthDate = new Date(userBirthDate);
    const today = new Date();
    const timeDiff = today.getTime() - birthDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  };

  const totalDaysLived = calculateDaysLived();

  // Leaf colors representing different life phases
  const getLeafColor = (dayNumber: number) => {
    const totalDays = totalDaysLived;
    const progress = dayNumber / totalDays;
    
    if (progress < 0.2) {
      // Childhood - bright green
      return '#32CD32';
    } else if (progress < 0.4) {
      // Youth - yellow-green
      return '#9ACD32';
    } else if (progress < 0.6) {
      // Young adult - golden
      return '#FFD700';
    } else if (progress < 0.8) {
      // Adult - orange
      return '#FF8C00';
    } else {
      // Mature - deep red/brown
      return '#CD853F';
    }
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
    
    return {
      id: `leaf-${dayNumber}-${Date.now()}`,
      x: Math.random() * (containerWidth - 60) + 30,
      y: -50,
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4,
      color: getLeafColor(dayNumber),
      fallSpeed: 1 + Math.random() * 2,
      swayAmplitude: 20 + Math.random() * 30,
      swayFrequency: 0.02 + Math.random() * 0.03,
      opacity: 0.8 + Math.random() * 0.2,
      dayNumber,
      date: getDateForDay(dayNumber)
    };
  };

  // Animation loop
  const animate = (timestamp: number) => {
    if (!isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // Drop new leaf based on speed
    const dropInterval = Math.max(50, 1000 / animationSpeed); // Minimum 50ms between drops
    
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

  // Get life phase name
  const getLifePhase = (dayNumber: number) => {
    const progress = dayNumber / totalDaysLived;
    if (progress < 0.2) return 'Childhood';
    if (progress < 0.4) return 'Youth';
    if (progress < 0.6) return 'Young Adult';
    if (progress < 0.8) return 'Adult';
    return 'Mature';
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
              {/* Leaf SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C12 2 8 6 8 12C8 16 10 18 12 18C14 18 16 16 16 12C16 6 12 2 12 2Z"
                  fill={leaf.color}
                  stroke={leaf.color}
                  strokeWidth="1"
                />
                <path
                  d="M12 6L12 18"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="1"
                />
              </svg>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Stats Display */}
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
          <div className="flex justify-between items-center min-w-[250px]">
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
          
          {currentDay > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Life Phase:</span>
              <span className="text-sm font-bold" style={{ color: theme.colors.accent }}>
                {getLifePhase(currentDay)}
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
            </div>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 right-6 z-10 flex gap-3">
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
            className="absolute bottom-20 right-6 z-10 p-6 rounded-2xl backdrop-blur-lg border shadow-lg"
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
                  max="100"
                  step="0.1"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${theme.colors.primary} 0%, ${theme.colors.primary} ${(animationSpeed / 100) * 100}%, #e5e7eb ${(animationSpeed / 100) * 100}%, #e5e7eb 100%)`
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

      {/* Legend */}
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
        <h4 className="text-sm font-bold text-gray-800 mb-3">Life Phases</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#32CD32' }}></div>
            <span className="text-xs text-gray-600">Childhood (0-20%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#9ACD32' }}></div>
            <span className="text-xs text-gray-600">Youth (20-40%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FFD700' }}></div>
            <span className="text-xs text-gray-600">Young Adult (40-60%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FF8C00' }}></div>
            <span className="text-xs text-gray-600">Adult (60-80%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#CD853F' }}></div>
            <span className="text-xs text-gray-600">Mature (80-100%)</span>
          </div>
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
            <p className="text-lg text-gray-600 mb-6">
              You've witnessed all {totalDaysLived.toLocaleString()} days of your life journey
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