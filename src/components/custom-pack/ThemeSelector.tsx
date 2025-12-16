import React from 'react';
import { motion } from 'framer-motion';
import { Dices } from 'lucide-react';
import { getAssetUrl } from '../../config/api';

// 主题配置
export const THEMES = [
  { id: 'dinosaur', name: 'Dinosaurs', image: getAssetUrl('/uploads/assets/A_main_assets/dinosaur/color/main/dinosaur_000_color.png'), color: '#a1e44d' },
  { id: 'space', name: 'Space', image: getAssetUrl('/uploads/assets/A_main_assets/space/color/main/space_000_color.png'), color: '#7bd3ea' },
  { id: 'vehicles', name: 'Cars', image: getAssetUrl('/uploads/assets/A_main_assets/vehicles/color/main/vehicles_000_color.png'), color: '#ff9f1c' },
  { id: 'unicorn', name: 'Unicorn', image: getAssetUrl('/uploads/assets/A_main_assets/unicorn/color/main/unicorn_000_color.png'), color: '#ff99c8' },
  { id: 'ocean', name: 'Ocean', image: getAssetUrl('/uploads/assets/A_main_assets/ocean/color/main/ocean_000_color.png'), color: '#7bd3ea' },
  { id: 'safari', name: 'Safari', image: getAssetUrl('/uploads/assets/A_main_assets/safari/color/main/safari_000_color.png'), color: '#ffd60a' }
];

export interface ThemeSelectorProps {
  selectedTheme: string | 'random';
  onThemeSelect: (theme: string | 'random') => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedTheme, onThemeSelect }) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 justify-items-center">
        {THEMES.map((theme, index) => (
          <motion.button
            key={theme.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, type: "spring" }}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onThemeSelect(theme.id)}
            className={`relative flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 border-3 rounded-2xl font-bold transition-all overflow-hidden ${
              selectedTheme === theme.id
                ? 'shadow-brutal scale-105 border-black'
                : 'bg-slate-50 border-slate-200 hover:border-black hover:shadow-brutal-sm'
            }`}
            style={{
              backgroundColor: selectedTheme === theme.id ? `${theme.color}40` : undefined
            }}
          >
            {selectedTheme === theme.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-xs"
              >
                ✓
              </motion.div>
            )}
            <motion.div 
              className="w-10 h-10 md:w-12 md:h-12 mb-1 flex items-center justify-center"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={theme.image} 
                alt={theme.name}
                className="max-w-full max-h-full object-contain drop-shadow-md"
              />
            </motion.div>
            <span className="text-xs font-bold">{theme.name}</span>
          </motion.button>
        ))}
    </div>
  );
};

// 随机主题按钮组件 - 用于放在标题旁边
export const RandomThemeButton: React.FC<{
  isSelected: boolean;
  onClick: () => void;
}> = ({ isSelected, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-xl font-bold text-xs transition-all ${
      isSelected
        ? 'bg-gradient-to-r from-duck-yellow via-duck-blue to-duck-green border-black shadow-brutal-sm'
        : 'bg-slate-100 border-slate-300 hover:border-black'
    }`}
  >
    <motion.div
      animate={isSelected ? { rotate: [0, 360] } : {}}
      transition={{ duration: 0.5 }}
    >
      <Dices size={14} />
    </motion.div>
    <span>Random</span>
    {isSelected && (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-xs"
      >
        ✓
      </motion.span>
    )}
  </motion.button>
);

export default ThemeSelector;
