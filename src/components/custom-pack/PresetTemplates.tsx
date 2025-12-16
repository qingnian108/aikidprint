import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  selections: Record<string, number>;
}

export interface PresetTemplatesProps {
  activePreset: string | null;
  onApplyPreset: (preset: PresetTemplate) => void;
}

// 预设模板配置
export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'balanced',
    name: 'Balanced Learning',
    description: 'Well-rounded mix of all skills',
    icon: '⚖️',
    selections: {
      // Literacy (5 pages)
      'uppercase-tracing': 2,
      'lowercase-tracing': 1,
      'letter-recognition': 1,
      'write-my-name': 1,
      // Math (5 pages)
      'number-tracing': 2,
      'counting-objects': 2,
      'number-path': 1,
      // Logic (4 pages)
      'maze': 2,
      'shadow-matching': 1,
      'pattern-sequencing': 1,
      // Creativity (4 pages)
      'coloring-page': 2,
      'trace-lines': 1,
      'shape-tracing': 1
    }
  },
  {
    id: 'math-focus',
    name: 'Math Focus',
    description: 'Extra practice with numbers',
    icon: '🔢',
    selections: {
      // Math (12 pages)
      'number-tracing': 3,
      'counting-objects': 3,
      'number-path': 2,
      'which-is-more': 2,
      'number-bonds': 1,
      'ten-frame': 1,
      // Literacy (3 pages)
      'uppercase-tracing': 2,
      'write-my-name': 1,
      // Logic (2 pages)
      'maze': 1,
      'pattern-sequencing': 1,
      // Creativity (1 page)
      'coloring-page': 1
    }
  },
  {
    id: 'literacy-boost',
    name: 'Literacy Boost',
    description: 'Focus on letters and reading',
    icon: '📚',
    selections: {
      // Literacy (12 pages)
      'uppercase-tracing': 3,
      'lowercase-tracing': 3,
      'letter-recognition': 2,
      'write-my-name': 1,
      'alphabet-sequencing': 1,
      'beginning-sounds': 1,
      'match-upper-lower': 1,
      // Math (3 pages)
      'number-tracing': 2,
      'counting-objects': 1,
      // Logic (2 pages)
      'maze': 1,
      'shadow-matching': 1,
      // Creativity (1 page)
      'coloring-page': 1
    }
  },
  {
    id: 'creative-play',
    name: 'Creative Play',
    description: 'Art and motor skills focus',
    icon: '🎨',
    selections: {
      // Creativity (10 pages)
      'coloring-page': 3,
      'trace-lines': 2,
      'shape-tracing': 2,
      'creative-prompt': 1,
      'trace-and-draw': 1,
      'shape-synthesis': 1,
      // Logic (4 pages)
      'maze': 2,
      'pattern-sequencing': 1,
      'matching-halves': 1,
      // Literacy (2 pages)
      'uppercase-tracing': 1,
      'write-my-name': 1,
      // Math (2 pages)
      'number-tracing': 1,
      'counting-objects': 1
    }
  }
];

// 计算预设的总页数
export const getPresetTotalPages = (preset: PresetTemplate): number => {
  return Object.values(preset.selections).reduce((sum, count) => sum + count, 0);
};

const PresetTemplates: React.FC<PresetTemplatesProps> = ({ activePreset, onApplyPreset }) => {
  return (
    <div className="space-y-3">
      {PRESET_TEMPLATES.map((preset, index) => {
        const isActive = activePreset === preset.id;
        const totalPages = getPresetTotalPages(preset);

        return (
          <motion.button
            key={preset.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onApplyPreset(preset)}
            className={`w-full text-left p-3 border-2 rounded-xl transition-all flex items-center gap-3 ${
              isActive
                ? 'border-black bg-duck-yellow/30 shadow-brutal-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-2xl">{preset.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{preset.name}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 bg-black text-white rounded-full flex items-center justify-center"
                  >
                    <Check size={10} />
                  </motion.div>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono truncate">{preset.description}</p>
            </div>
            <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
              {totalPages}p
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default PresetTemplates;
