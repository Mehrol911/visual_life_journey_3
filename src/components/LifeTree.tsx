import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeStats, ProfessionTheme } from '../types';
import { AlertCircle } from 'lucide-react';

interface LifeTreeProps {
  lifeStats: LifeStats;
  theme: ProfessionTheme;
}

interface Leaf {
  id: number;
  x: number;
  y: number;
  rotation: number;
  fallen: boolean;
  size: number;
  color: string;
  branchId: number;
  originalX: number;
  originalY: number;
  fallDelay: number;
  opacity: number;
  isFalling: boolean;
  fallProgress: number;
}

interface Branch {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number;
  length: number;
  level: number;
  parentId?: number;
  thickness: number;
  leafPositions: { x: number; y: number }[];
}

export const LifeTree: React.FC<LifeTreeProps> = ({ lifeStats, theme }) => {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [treeGrown, setTreeGrown] = useState(false);
  const [leavesGrown, setLeavesGrown] = useState(false);
  const [leavesFalling, setLeavesFalling] = useState(false);
  const [showTooltip, setShowTooltip] = useState<'green' | 'fallen' | null>(null);

  // Create realistic tree structure using recursive branching
  const treeStructure = useMemo(() => {
    const branches: Branch[] = [];
    let branchId = 0;

    // Recursive function to create branches
    const createBranch = (
      startX: number, 
      startY: number, 
      angle: number, 
      length: number, 
      thickness: number, 
      level: number, 
      parentId?: number
    ): Branch => {
      const endX = startX + Math.cos(angle) * length;
      const endY = startY - Math.sin(angle) * length; // Negative because Y increases downward
      
      const branch: Branch = {
        id: branchId++,
        startX,
        startY,
        endX,
        endY,
        angle,
        length,
        level,
        parentId,
        thickness,
        leafPositions: []
      };

      // Add leaf positions along the branch (more at the end)
      if (level >= 2) { // Only add leaves to smaller branches
        const numLeaves = level === 2 ? 8 : 12;
        for (let i = 0; i < numLeaves; i++) {
          const progress = 0.6 + (i / numLeaves) * 0.4; // Leaves towards the end
          const leafX = startX + Math.cos(angle) * length * progress;
          const leafY = startY - Math.sin(angle) * length * progress;
          
          // Add some natural spread around the branch
          const spread = 15;
          const offsetX = (Math.random() - 0.5) * spread;
          const offsetY = (Math.random() - 0.5) * spread * 0.5;
          
          branch.leafPositions.push({
            x: leafX + offsetX,
            y: leafY + offsetY
          });
        }
      }

      branches.push(branch);

      // Recursively create child branches
      if (level < 4 && length > 20) {
        const numChildren = level === 0 ? 6 : level === 1 ? 4 : 3;
        const angleSpread = level === 0 ? Math.PI / 3 : Math.PI / 4;
        
        for (let i = 0; i < numChildren; i++) {
          const childAngle = angle + (i - numChildren/2) * (angleSpread / numChildren) + (Math.random() - 0.5) * 0.3;
          const childLength = length * (0.6 + Math.random() * 0.2);
          const childThickness = thickness * 0.7;
          const branchStart = 0.7 + Math.random() * 0.2; // Start child branch partway up parent
          
          const childStartX = startX + Math.cos(angle) * length * branchStart;
          const childStartY = startY - Math.sin(angle) * length * branchStart;
          
          createBranch(childStartX, childStartY, childAngle, childLength, childThickness, level + 1, branch.id);
        }
      }

      return branch;
    };

    // Create main trunk
    const trunkBase = { x: 400, y: 500 };
    createBranch(trunkBase.x, trunkBase.y, Math.PI / 2, 120, 25, 0);

    return branches;
  }, []);

  // Generate leaves based on tree structure and life statistics
  useEffect(() => {
    const newLeaves: Leaf[] = [];
    let leafId = 0;
    
    // Calculate leaves needed
    const daysPerLeaf = 10;
    const leavesLived = Math.floor(lifeStats.days_lived / daysPerLeaf);
    const leavesRemaining = Math.floor(lifeStats.days_remaining / daysPerLeaf);

    // 1. GREEN LEAVES ON TREE (Days Remaining) - Attached to branches
    const leafBranches = treeStructure.filter(b => b.level >= 2 && b.leafPositions.length > 0);
    let remainingLeavesToPlace = leavesRemaining;
    
    leafBranches.forEach(branch => {
      branch.leafPositions.forEach(pos => {
        if (remainingLeavesToPlace > 0) {
          newLeaves.push({
            id: leafId++,
            x: pos.x,
            y: pos.y,
            originalX: pos.x,
            originalY: pos.y,
            rotation: Math.random() * 360,
            fallen: false,
            size: 0.8 + Math.random() * 0.4,
            color: '#22c55e',
            branchId: branch.id,
            fallDelay: 0,
            opacity: 0.9 + Math.random() * 0.1,
            isFalling: false,
            fallProgress: 0
          });
          remainingLeavesToPlace--;
        }
      });
    });

    // 2. FALLEN LEAVES ON GROUND (Days Lived) - Scattered on ground
    const groundY = 520; // Lower on the ground
    const groundCenterX = 400;
    const scatterRadius = 180; // Wider spread
    
    for (let i = 0; i < leavesLived; i++) {
      // Create natural ground scatter pattern
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * scatterRadius * (0.3 + Math.random() * 0.7); // More natural clustering
      const groundX = groundCenterX + Math.cos(angle) * distance;
      const finalGroundY = groundY + (Math.random() - 0.5) * 30; // More ground variation
      
      // Vary colors for fallen leaves
      const fallenColors = ['#8b4513', '#a0522d', '#cd853f', '#deb887', '#d2691e', '#bc8f8f', '#daa520'];
      
      newLeaves.push({
        id: leafId++,
        x: groundX,
        y: finalGroundY,
        originalX: 300 + Math.random() * 200, // Original position in tree
        originalY: 300 + Math.random() * 100,
        rotation: Math.random() * 360,
        fallen: true,
        size: 0.7 + Math.random() * 0.4, // Slightly larger fallen leaves
        color: fallenColors[Math.floor(Math.random() * fallenColors.length)],
        branchId: -1,
        fallDelay: Math.random() * 3,
        opacity: 0.7 + Math.random() * 0.3,
        isFalling: false,
        fallProgress: 1
      });
    }

    setLeaves(newLeaves);
  }, [lifeStats, treeStructure]);

  // Animation sequence
  useEffect(() => {
    const sequence = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTreeGrown(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLeavesGrown(true);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLeavesFalling(true);
    };
    
    sequence();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Beautiful sky background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom,
            #87CEEB 0%,
            #98D8E8 15%,
            #B0E0E6 30%,
            #E0F6FF 50%,
            #F0F8FF 70%,
            #FFFACD 85%,
            #F5F5DC 100%)`
        }}
      />

      {/* Sun with rays */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 1 }}
        className="absolute top-20 right-24 w-28 h-28 rounded-full"
        style={{
          background: `radial-gradient(circle, #FFD700 0%, #FFA500 40%, #FF8C00 70%, transparent 100%)`,
          boxShadow: `0 0 60px rgba(255, 215, 0, 0.8), 0 0 120px rgba(255, 165, 0, 0.4)`
        }}
      />

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-60">
        <div 
          style={{
            background: `linear-gradient(to bottom,
              transparent 0%,
              rgba(34, 139, 34, 0.1) 20%,
              rgba(76, 175, 80, 0.4) 50%,
              rgba(104, 159, 56, 0.7) 80%,
              rgba(85, 107, 47, 0.9) 100%)`
          }}
          className="absolute inset-0"
        />
      </div>

      {/* Tree Structure - SVG for precise drawing */}
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Bark gradient */}
          <radialGradient id="barkGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#DEB887" />
            <stop offset="30%" stopColor="#D2B48C" />
            <stop offset="60%" stopColor="#CD853F" />
            <stop offset="80%" stopColor="#A0522D" />
            <stop offset="100%" stopColor="#8B4513" />
          </radialGradient>
          
          {/* Tree shadow */}
          <filter id="treeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="4" dy="6" stdDeviation="6" floodOpacity="0.3" floodColor="#000"/>
          </filter>
        </defs>
        
        {/* Roots */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI + Math.PI * 0.8;
            const rootLength = 20 + Math.random() * 25;
            const startX = 400 + (Math.random() - 0.5) * 20;
            const startY = 500;
            const endX = startX + Math.cos(angle) * rootLength;
            const endY = startY + Math.sin(angle) * rootLength * 0.3;
            
            return (
              <motion.line
                key={i}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 1.5, delay: 0.8 + i * 0.1 }}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="url(#barkGradient)"
                strokeWidth={Math.max(2, 8 - i * 0.5)}
                strokeLinecap="round"
                filter="url(#treeShadow)"
              />
            );
          })}
        </motion.g>
        
        {/* Tree branches */}
        {treeStructure.map((branch, index) => (
          <motion.line
            key={branch.id}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={treeGrown ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ 
              duration: 1.5, 
              delay: 1.2 + branch.level * 0.3 + index * 0.02,
              ease: "easeOut"
            }}
            x1={branch.startX}
            y1={branch.startY}
            x2={branch.endX}
            y2={branch.endY}
            stroke="url(#barkGradient)"
            strokeWidth={branch.thickness}
            strokeLinecap="round"
            filter="url(#treeShadow)"
          />
        ))}
      </svg>

      {/* GREEN LEAVES ON TREE (Days Remaining) */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {leaves.filter(leaf => !leaf.fallen).map((leaf, index) => (
            <motion.div
              key={`green-${leaf.id}`}
              className="absolute cursor-pointer"
              style={{
                left: leaf.x - 5,
                top: leaf.y - 5,
                width: `${leaf.size * 12}px`,
                height: `${leaf.size * 12}px`,
                backgroundColor: leaf.color,
                borderRadius: '50% 15% 50% 50%',
                transform: `rotate(${leaf.rotation}deg)`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                opacity: leaf.opacity,
                background: `radial-gradient(ellipse at 30% 30%, #4ade80, ${leaf.color}, #16a34a)`,
                zIndex: 10
              }}
              initial={{ 
                scale: 0,
                opacity: 0,
              }}
              animate={leavesGrown ? {
                scale: [0, leaf.size * 1.2, leaf.size],
                opacity: [0, 1, leaf.opacity],
              } : {}}
              transition={{
                duration: 1.5,
                delay: 3.5 + index * 0.005,
                ease: "easeOut",
              }}
              onMouseEnter={() => setShowTooltip('green')}
              onMouseLeave={() => setShowTooltip(null)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Gentle leaf movement for living leaves */}
      <div className="absolute inset-0">
        {leavesGrown && leaves.filter(leaf => !leaf.fallen).map((leaf, index) => (
          <motion.div
            key={`sway-${leaf.id}`}
            className="absolute pointer-events-none"
            style={{
              left: leaf.x - 5,
              top: leaf.y - 5,
              width: `${leaf.size * 12}px`,
              height: `${leaf.size * 12}px`,
              zIndex: 9
            }}
            animate={{
              x: [0, Math.sin(index * 0.1) * 2, 0],
              y: [0, Math.cos(index * 0.1) * 1, 0],
              rotate: [leaf.rotation - 2, leaf.rotation + 2, leaf.rotation - 2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.02
            }}
          />
        ))}
      </div>

      {/* FALLEN LEAVES ON GROUND (Days Lived) */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {leaves.filter(leaf => leaf.fallen).map((leaf, index) => (
            <motion.div
              key={`fallen-${leaf.id}`}
              className="absolute cursor-pointer"
              style={{
                left: leaf.x - 4,
                top: leaf.y - 4,
                width: `${leaf.size * 12}px`,
                height: `${leaf.size * 12}px`,
                backgroundColor: leaf.color,
                borderRadius: '50% 15% 50% 50%',
                transform: `rotate(${leaf.rotation}deg)`,
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
                opacity: leaf.opacity,
                background: `radial-gradient(ellipse at 30% 30%, ${leaf.color}, #8b4513)`,
                zIndex: 15 // Higher z-index to ensure visibility
              }}
              initial={{ opacity: 0, scale: 0, y: -300, x: leaf.originalX - leaf.x, rotate: 0 }}
              animate={leavesFalling ? { 
                opacity: leaf.opacity, 
                scale: 1,
                y: 0,
                x: 0,
                rotate: leaf.rotation
              } : {}}
              transition={{ 
                duration: 2.5 + Math.random() * 1.5, 
                delay: 6 + leaf.fallDelay + index * 0.01,
                ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for realistic fall
              }}
              onMouseEnter={() => setShowTooltip('fallen')}
              onMouseLeave={() => setShowTooltip(null)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Enhanced Tooltips */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div 
              className="px-8 py-4 rounded-2xl backdrop-blur-lg border text-center shadow-2xl"
              style={{ 
                background: 'rgba(255,255,255,0.98)',
                borderColor: theme.colors.primary + '40',
                color: theme.colors.text,
                boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 20px ${theme.colors.primary}20`
              }}
            >
              {showTooltip === 'green' ? (
                <div>
                  <p className="font-bold text-green-600 text-lg mb-1">🌿 Green Leaves</p>
                  <p className="text-sm font-medium mb-2">Days remaining in your life journey</p>
                  <p className="text-xs text-gray-600 bg-green-50 px-3 py-1 rounded-full">
                    {lifeStats.days_remaining.toLocaleString()} days of possibility
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-amber-600 text-lg mb-1">🍂 Fallen Leaves</p>
                  <p className="text-sm font-medium mb-2">Your cherished memories - days already lived</p>
                  <p className="text-xs text-gray-600 bg-amber-50 px-3 py-1 rounded-full">
                    {lifeStats.days_lived.toLocaleString()} precious days experienced
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inspirational Quote */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 7 }}
        className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div 
          className="px-10 py-5 rounded-full backdrop-blur-xl border text-center max-w-3xl shadow-lg"
          style={{ 
            background: 'rgba(255,255,255,0.95)',
            borderColor: theme.colors.primary + '30',
            color: theme.colors.text
          }}
        >
          <p className="text-lg font-medium italic">
            "Each fallen leaf represents a day lived, each green leaf a day of possibility ahead"
          </p>
        </div>
      </motion.div>

      {/* Enhanced Life Statistics Dashboard */}
      <div className="absolute bottom-6 left-6 right-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 5 }}
          className="backdrop-blur-xl rounded-3xl p-8 border shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.98)',
            borderColor: theme.colors.primary + '30',
            color: theme.colors.text,
            boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 30px ${theme.colors.primary}15`
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-8">
            <div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 5.5 }}
                className="text-4xl font-bold mb-3" 
                style={{ color: theme.colors.primary }}
              >
                {lifeStats.current_age}
              </motion.div>
              <div className="text-sm font-semibold text-gray-700">Years of Wisdom</div>
            </div>
            <div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 5.7 }}
                className="text-4xl font-bold mb-3" 
                style={{ color: '#8b4513' }}
              >
                {(lifeStats.days_lived / 1000).toFixed(1)}k
              </motion.div>
              <div className="text-sm font-semibold text-gray-700">Cherished Memories (🍂)</div>
            </div>
            <div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 5.9 }}
                className="text-4xl font-bold mb-3" 
                style={{ color: '#22c55e' }}
              >
                {(lifeStats.days_remaining / 1000).toFixed(1)}k
              </motion.div>
              <div className="text-sm font-semibold text-gray-700">Days of Possibility (🌿)</div>
            </div>
            <div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 6.1 }}
                className="text-4xl font-bold mb-3" 
                style={{ color: theme.colors.primary }}
              >
                {lifeStats.life_percentage.toFixed(1)}%
              </motion.div>
              <div className="text-sm font-semibold text-gray-700">Journey Complete</div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-4">
              <span className="font-semibold text-gray-700">Life Progress</span>
              <span className="font-bold" style={{ color: theme.colors.primary }}>
                {lifeStats.life_percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <motion.div
                className="h-4 rounded-full relative"
                style={{ 
                  background: theme.gradients.primary,
                  boxShadow: `0 0 20px ${theme.colors.primary}40`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${lifeStats.life_percentage}%` }}
                transition={{ duration: 4, delay: 6.5, ease: "easeOut" }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  animate={{ x: [-100, 400] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 7 }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};