import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Category } from '../../constants/pageTypes';
import QuantitySelector from './QuantitySelector';

export interface CategorySelectorProps {
  categories: Category[];
  selections: Record<string, number>;
  expandedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  onQuantityChange: (pageTypeId: string, delta: number) => void;
}

// 分类颜色映射
const categoryGradients: Record<string, string> = {
  literacy: 'from-amber-300 via-orange-300 to-yellow-400',
  math: 'from-emerald-300 via-teal-300 to-green-400',
  logic: 'from-cyan-300 via-blue-300 to-indigo-400',
  creativity: 'from-rose-300 via-pink-300 to-fuchsia-300'
};

const categoryBgColors: Record<string, string> = {
  literacy: 'bg-amber-50',
  math: 'bg-emerald-50',
  logic: 'bg-cyan-50',
  creativity: 'bg-rose-50'
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selections,
  expandedCategories,
  onToggleCategory,
  onQuantityChange
}) => {
  // 计算分类内已选数量
  const getCategoryCount = (category: Category): number => {
    return category.pageTypes.reduce((sum, pt) => sum + (selections[pt.id] || 0), 0);
  };

  return (
    <div className="space-y-4">
      {categories.map((category, index) => {
        const Icon = category.icon;
        const isExpanded = expandedCategories.includes(category.id);
        const categoryCount = getCategoryCount(category);
        const gradient = categoryGradients[category.id] || 'from-gray-200 to-gray-300';
        const bgColor = categoryBgColors[category.id] || 'bg-gray-50';

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-3 border-black rounded-2xl overflow-hidden shadow-brutal"
          >
            {/* 分类头部 - 可点击展开/收起 */}
            <motion.button
              onClick={() => onToggleCategory(category.id)}
              className={`w-full bg-gradient-to-r ${gradient} p-4 flex items-center justify-between hover:brightness-105 transition-all`}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-brutal-sm">
                  <Icon size={24} className="text-black" />
                </div>
                <div className="text-left">
                  <h3 className="font-display font-bold text-lg text-black">{category.title}</h3>
                  <p className="text-sm text-black/70 font-mono">{category.pageTypes.length} templates</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {categoryCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-black text-white px-3 py-1 rounded-full font-bold text-sm"
                  >
                    {categoryCount} selected
                  </motion.div>
                )}
                <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </motion.button>

            {/* 展开的内容 */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className={`${bgColor} overflow-hidden`}
                >
                  <div className="p-4 grid gap-3">
                    {category.pageTypes.map((pageType, ptIndex) => {
                      const count = selections[pageType.id] || 0;
                      const isSelected = count > 0;

                      return (
                        <motion.div
                          key={pageType.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: ptIndex * 0.03 }}
                          className={`bg-white border-2 rounded-xl p-3 flex items-center justify-between transition-all ${
                            isSelected 
                              ? 'border-black shadow-brutal-sm' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm truncate">{pageType.title}</h4>
                              {isSelected && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="bg-duck-green text-black text-xs px-2 py-0.5 rounded-full font-bold"
                                >
                                  ×{count}
                                </motion.span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-mono truncate">{pageType.description}</p>
                          </div>
                          
                          <QuantitySelector
                            value={count}
                            onChange={(delta) => onQuantityChange(pageType.id, delta)}
                            min={0}
                            max={10}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CategorySelector;
