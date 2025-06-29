import React from 'react';
import { motion } from 'framer-motion';
import { PROFESSIONS } from '../data/professions';
import { ProfessionTheme } from '../types';
import { 
  Sparkles, 
  Zap, 
  Stethoscope, 
  GraduationCap, 
  Cog, 
  Palette, 
  TrendingUp, 
  PenTool, 
  Microscope, 
  ChefHat, 
  Scale, 
  Layers 
} from 'lucide-react';

const professionIcons = {
  'Doctor': Stethoscope,
  'Teacher': GraduationCap,
  'Engineer': Cog,
  'Artist': Palette,
  'Entrepreneur': TrendingUp,
  'Writer': PenTool,
  'Scientist': Microscope,
  'Chef': ChefHat,
  'Lawyer': Scale,
  'Designer': Layers,
};

interface ProfessionSelectorProps {
  selectedProfession: ProfessionTheme | null;
  onSelect: (profession: ProfessionTheme) => void;
  onContinue: () => void;  // Add this line
}

export const ProfessionSelector: React.FC<ProfessionSelectorProps> = ({
  selectedProfession,
  onSelect,
  onContinue  
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-yellow-400 mr-3" />
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Choose Your Path
            </h2>
            <Zap className="w-8 h-8 text-blue-400 ml-3" />
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your profession shapes your journey. Select the path that resonates with your soul,
            and watch as your entire experience transforms to reflect your calling.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {PROFESSIONS.map((profession, index) => {
            const IconComponent = professionIcons[profession.name as keyof typeof professionIcons];
            
            return (
              <motion.button
                key={profession.name}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -8,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(profession)}
                className={`
                  group relative overflow-hidden rounded-3xl p-6 text-center
                  border-2 transition-all duration-300 ease-out backdrop-blur-lg
                  ${selectedProfession?.name === profession.name 
                    ? 'border-white/40 shadow-2xl' 
                    : 'border-white/10 hover:border-white/30'
                  }
                `}
                style={{
                  background: selectedProfession?.name === profession.name 
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)' 
                    : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                }}
              >
                {/* Animated background gradient */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: profession.gradients.primary,
                    filter: 'blur(20px)',
                  }}
                />
                
                {/* Content */}
                <div className="relative z-10">
                  <div 
                    className={`
                      w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center
                      text-white transition-all duration-300 group-hover:scale-110
                      ${selectedProfession?.name === profession.name ? 'scale-110 shadow-lg' : ''}
                    `}
                    style={{
                      background: profession.gradients.primary,
                      boxShadow: selectedProfession?.name === profession.name 
                        ? `0 10px 30px ${profession.colors.primary}40` 
                        : 'none'
                    }}
                  >
                    {IconComponent ? (
                      <IconComponent className="w-8 h-8" />
                    ) : (
                      <span className="text-xl font-bold">{profession.name.charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white group-hover:text-white/90 transition-colors">
                    {profession.name}
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 leading-tight transition-colors">
                    {profession.description.split(',')[0]}
                  </p>
                </div>

                {/* Selection indicator */}
                {selectedProfession?.name === profession.name && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: profession.colors.primary }}
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}

                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 20px ${profession.colors.primary}20`,
                  }}
                />
              </motion.button>
            );
          })}
        </div>
        {selectedProfession && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 p-8 rounded-3xl text-center backdrop-blur-lg border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            }}
          >
            <blockquote className="text-2xl md:text-3xl font-medium italic mb-6 text-white leading-relaxed">
              "{selectedProfession.quote}"
            </blockquote>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              {selectedProfession.description}
            </p>
            
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.8 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="px-8 py-3 rounded-full text-white font-semibold text-lg transition-all duration-300 shadow-lg"
              style={{ 
                background: selectedProfession.gradients.primary,
                boxShadow: `0 8px 32px ${selectedProfession.colors.primary}40`
              }}
            >
              Continue Your Journey →
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};