import React from 'react';
import { motion } from 'framer-motion';
import { Package, Sparkles } from 'lucide-react';
import { Category } from '../../constants/pageTypes';

export interface PackSummaryProps {
  selections: Record<string, number>;
  categories: Category[];
}

// 分类颜色映射
const categoryColors: Record<string, string> = {
  literacy: '#f59e0b', // amber
  math: '#10b981',     // emerald
  logic: '#06b6d4',    // cyan
  creativity: '#ec4899' // pink
};

// 计算总页数
export const calculateTotalPages = (selections: Record<string, number>): number => {
  return Object.values(selections).reduce((sum, count) => sum + count, 0);
};

// 计算每个分类的页数
export const calculateCategoryCounts = (
  selections: Record<string, number>,
  categories: Category[]
): Record<string, number> => {
  const counts: Record<string, number> = {};
  
  for (const category of categories) {
    counts[category.id] = category.pageTypes.reduce(
      (sum, pt) => sum + (selections[pt.id] || 0),
      0
    );
  }
  
  return counts;
};

const PackSummary: React.FC<PackSummaryProps> = ({ selections, categories }) => {
  const totalPages = calculateTotalPages(selections);
  const categoryCounts = calculateCategoryCounts(selections, categories);

  return (
    <div className="space-y-6">
      {/* 总页数显示 */}
      <div className="text-center">
        <motion.div
          key={totalPages}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className="text-6xl font-display font-black text-black mb-2"
        >
          {totalPages}
        </motion.div>
        <div className="text-slate-500 font-mono flex items-center justify-center gap-2">
          <Package size={16} />
          pages selected
        </div>
      </div>

      {/* 空状态 */}
      {totalPages === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 px-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200"
        >
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 font-mono text-sm">
            Start adding worksheets to build your pack!
          </p>
        </motion.div>
      ) : (
        /* 分类占比进度条 */
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-600 uppercase tracking-wide">
            Category Breakdown
          </h4>
          
          {categories.map((category) => {
            const count = categoryCounts[category.id] || 0;
            const percentage = totalPages > 0 ? (count / totalPages) * 100 : 0;
            const color = categoryColors[category.id] || '#6b7280';

            return (
              <div key={category.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{category.title}</span>
                  <motion.span
                    key={count}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="font-bold"
                    style={{ color }}
                  >
                    {count}
                  </motion.span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 页数统计 */}
      {totalPages > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4 border-t border-slate-200"
        >
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-duck-yellow/20 rounded-lg p-2">
              <div className="text-lg font-bold">{Object.keys(selections).filter(k => selections[k] > 0).length}</div>
              <div className="text-xs text-slate-600 font-mono">Types</div>
            </div>
            <div className="bg-duck-blue/20 rounded-lg p-2">
              <div className="text-lg font-bold">{Object.values(categoryCounts).filter(c => c > 0).length}</div>
              <div className="text-xs text-slate-600 font-mono">Categories</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PackSummary;
