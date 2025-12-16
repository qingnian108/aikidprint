import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

export interface QuantitySelectorProps {
  value: number;
  onChange: (delta: number) => void;
  min?: number;
  max?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 0,
  max = 99
}) => {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className="flex items-center gap-1">
      {/* 减少按钮 */}
      <motion.button
        whileHover={canDecrement ? { scale: 1.1 } : {}}
        whileTap={canDecrement ? { scale: 0.9 } : {}}
        onClick={() => canDecrement && onChange(-1)}
        disabled={!canDecrement}
        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
          canDecrement
            ? 'border-black bg-white hover:bg-slate-100 cursor-pointer'
            : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
        }`}
      >
        <Minus size={16} />
      </motion.button>

      {/* 数字显示 */}
      <motion.div
        key={value}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        className={`w-10 h-8 flex items-center justify-center font-bold text-lg ${
          value > 0 ? 'text-black' : 'text-slate-400'
        }`}
      >
        {value}
      </motion.div>

      {/* 增加按钮 */}
      <motion.button
        whileHover={canIncrement ? { scale: 1.1 } : {}}
        whileTap={canIncrement ? { scale: 0.9 } : {}}
        onClick={() => canIncrement && onChange(1)}
        disabled={!canIncrement}
        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
          canIncrement
            ? 'border-black bg-duck-yellow hover:bg-duck-yellow/80 cursor-pointer'
            : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
        }`}
      >
        <Plus size={16} />
      </motion.button>
    </div>
  );
};

export default QuantitySelector;
