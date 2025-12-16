import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Package, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../constants/pageTypes';
import { API_BASE_URL } from '../config/api';
import ThemeSelector, { THEMES, RandomThemeButton } from '../components/custom-pack/ThemeSelector';
import CategorySelector from '../components/custom-pack/CategorySelector';
import PackSummary from '../components/custom-pack/PackSummary';
import PresetTemplates, { PresetTemplate } from '../components/custom-pack/PresetTemplates';

// 浮动装饰元素
const FloatingElement: React.FC<{ delay: number; children: React.ReactNode; className?: string }> = ({ delay, children, className }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    animate={{
      y: [0, -15, 0],
      rotate: [-5, 5, -5],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.div>
);

// 组件状态类型
interface CustomPackState {
  theme: string | 'random';
  selections: Record<string, number>;
  activePreset: string | null;
  isGenerating: boolean;
  expandedCategories: string[];
}

const CustomPack: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // 状态管理
  const [state, setState] = useState<CustomPackState>({
    theme: 'random',
    selections: {},
    activePreset: null,
    isGenerating: false,
    expandedCategories: []
  });

  // 计算总页数
  const totalPages = Object.values(state.selections).reduce((sum, count) => sum + count, 0);

  // 主题选择处理
  const handleThemeSelect = (theme: string | 'random') => {
    setState(prev => ({ ...prev, theme }));
  };

  // 数量变更处理
  const handleQuantityChange = (pageTypeId: string, delta: number) => {
    setState(prev => {
      const currentCount = prev.selections[pageTypeId] || 0;
      const newCount = Math.max(0, currentCount + delta);
      const newSelections = { ...prev.selections };
      
      if (newCount === 0) {
        delete newSelections[pageTypeId];
      } else {
        newSelections[pageTypeId] = newCount;
      }
      
      return {
        ...prev,
        selections: newSelections,
        activePreset: null // 手动修改时清除预设
      };
    });
  };

  // 分类展开/收起处理
  const handleToggleCategory = (categoryId: string) => {
    setState(prev => ({
      ...prev,
      expandedCategories: prev.expandedCategories.includes(categoryId)
        ? prev.expandedCategories.filter(id => id !== categoryId)
        : [...prev.expandedCategories, categoryId]
    }));
  };

  // 应用预设处理
  const handleApplyPreset = (preset: PresetTemplate) => {
    setState(prev => ({
      ...prev,
      selections: { ...preset.selections },
      activePreset: preset.id,
      // 展开所有有选择的分类
      expandedCategories: CATEGORIES
        .filter(cat => cat.pageTypes.some(pt => preset.selections[pt.id] > 0))
        .map(cat => cat.id)
    }));
  };

  // 生成处理
  const handleGenerate = async () => {
    if (totalPages === 0) return;
    
    setState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      // 如果是随机主题，随机选择一个
      const finalTheme = state.theme === 'random' 
        ? THEMES[Math.floor(Math.random() * THEMES.length)].id 
        : state.theme;
      
      const response = await fetch(`${API_BASE_URL}/api/custom-pack/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: finalTheme,
          selections: state.selections,
          userId: currentUser?.uid
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.packId) {
        navigate(`/custom-pack/preview/${data.packId}`);
      } else {
        console.error('Generation failed:', data.error);
        alert('Generation failed. Please try again.');
        setState(prev => ({ ...prev, isGenerating: false }));
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Generation failed. Please try again.');
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // 加载状态
  if (state.isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-duck-yellow/30 via-white to-duck-blue/30 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full"
              style={{
                background: i % 3 === 0 ? '#FFE066' : i % 3 === 1 ? '#7BD3EA' : '#A1E44D',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ scale: [0, 1, 0], opacity: [0, 0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        
        <motion.div className="text-center z-10" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 bg-duck-blue/20 rounded-full animate-ping" />
            <Loader className="w-24 h-24 text-duck-blue" />
          </motion.div>
          
          <motion.h2 
            className="text-4xl font-display font-bold text-black mb-3"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Building Your Custom Pack...
          </motion.h2>
          <p className="text-slate-600 font-mono text-lg">✨ Generating {totalPages} personalized pages</p>
          
          <motion.div 
            className="mt-8 flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {['📝', '🎨', '🔢', '✏️', '🌟'].map((emoji, i) => (
              <motion.span
                key={i}
                className="text-3xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-duck-yellow/20 via-white to-duck-blue/20 py-12 px-4 relative overflow-hidden">
      {/* 浮动装饰元素 */}
      <FloatingElement delay={0} className="top-20 left-10 text-5xl opacity-60">🎨</FloatingElement>
      <FloatingElement delay={0.5} className="top-40 right-16 text-4xl opacity-50">📚</FloatingElement>
      <FloatingElement delay={1} className="bottom-32 left-20 text-4xl opacity-50">🔢</FloatingElement>
      <FloatingElement delay={1.5} className="bottom-20 right-10 text-5xl opacity-60">✏️</FloatingElement>
      <FloatingElement delay={2} className="top-60 left-1/4 text-3xl opacity-40">⭐</FloatingElement>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full font-bold mb-6 shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Package size={20} />
            Custom Pack Builder
            <Sparkles size={16} className="text-duck-yellow" />
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-display font-black text-black mb-4 leading-tight">
            Build Your
            <br />
            <motion.span 
              className="text-duck-blue inline-block"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Custom Pack
            </motion.span>
          </h1>
          
          <p className="text-xl text-slate-600 font-mono">
            Choose exactly what you want • Mix and match worksheets
          </p>
        </motion.div>

        {/* 主内容区域 */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：主题选择和分类选择 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 主题选择区域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-4 border-black rounded-3xl shadow-brutal p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🎨</span> Select Theme
                </h2>
                <RandomThemeButton
                  isSelected={state.theme === 'random'}
                  onClick={() => handleThemeSelect('random')}
                />
              </div>
              <ThemeSelector
                selectedTheme={state.theme}
                onThemeSelect={handleThemeSelect}
              />
            </motion.div>

            {/* 分类选择区域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-4 border-black rounded-3xl shadow-brutal p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span> Select Worksheets
              </h2>
              <CategorySelector
                categories={CATEGORIES}
                selections={state.selections}
                expandedCategories={state.expandedCategories}
                onToggleCategory={handleToggleCategory}
                onQuantityChange={handleQuantityChange}
              />
            </motion.div>
          </div>

          {/* 右侧：摘要和预设 */}
          <div className="space-y-6">
            {/* 摘要区域 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border-4 border-black rounded-3xl shadow-brutal p-6 sticky top-32"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span> Pack Summary
              </h2>
              
              <PackSummary
                selections={state.selections}
                categories={CATEGORIES}
              />
              
              {/* 生成按钮 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={totalPages === 0}
                className="w-full bg-duck-blue text-black border-3 border-black text-xl px-8 py-4 font-bold shadow-brutal rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-6 hover:shadow-brutal-lg transition-all"
              >
                <Sparkles size={24} />
                Generate Pack
              </motion.button>
              
              {totalPages === 0 && (
                <p className="text-center text-sm text-slate-500 font-mono mt-3">
                  Add worksheets to enable generation
                </p>
              )}
            </motion.div>

            {/* 预设模板区域 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white border-4 border-black rounded-3xl shadow-brutal p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span> Quick Presets
              </h2>
              <PresetTemplates
                activePreset={state.activePreset}
                onApplyPreset={handleApplyPreset}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPack;
