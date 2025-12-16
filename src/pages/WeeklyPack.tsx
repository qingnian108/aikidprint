import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Download, Loader, Sparkles, Package, Star, Zap, Heart, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, recordDownload } from '../services/firestoreService';
import PODOption from '../components/PODOption';
import { API_BASE_URL, getAssetUrl } from '../config/api';

const AGES = [
  { value: '2-3', label: '2-3 years', icon: '👶' },
  { value: '3-4', label: '3-4 years', icon: '🧒' },
  { value: '4-5', label: '4-5 years', icon: '👧' },
  { value: '5-6', label: '5-6 years', icon: '👦' }
];

const THEMES = [
  { id: 'dinosaur', name: 'Dinosaurs', image: getAssetUrl('/uploads/assets/A_main_assets/dinosaur/color/main/dinosaur_000_color.png'), color: '#a1e44d' },
  { id: 'space', name: 'Space', image: getAssetUrl('/uploads/assets/A_main_assets/space/color/main/space_000_color.png'), color: '#7bd3ea' },
  { id: 'vehicles', name: 'Cars', image: getAssetUrl('/uploads/assets/A_main_assets/vehicles/color/main/vehicles_000_color.png'), color: '#ff9f1c' },
  { id: 'unicorn', name: 'Unicorn', image: getAssetUrl('/uploads/assets/A_main_assets/unicorn/color/main/unicorn_000_color.png'), color: '#ff99c8' },
  { id: 'ocean', name: 'Ocean', image: getAssetUrl('/uploads/assets/A_main_assets/ocean/color/main/ocean_000_color.png'), color: '#7bd3ea' },
  { id: 'safari', name: 'Safari', image: getAssetUrl('/uploads/assets/A_main_assets/safari/color/main/safari_000_color.png'), color: '#ffd60a' }
];

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

// 生成的页面类型
interface GeneratedPage {
  order: number;
  type: string;
  title: string;
  imageUrl: string;
}

const WeeklyPack: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [theme, setTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedPages, setGeneratedPages] = useState<GeneratedPage[]>([]);
  const [error, setError] = useState<string>('');
  const [userPlan, setUserPlan] = useState<'Free' | 'Pro'>('Free');
  const [isDownloading, setIsDownloading] = useState(false);
  const [packId, setPackId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 获取用户订阅计划
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (currentUser) {
        try {
          const userData = await getUserData(currentUser.uid);
          if (userData) {
            setUserPlan(userData.plan);
          }
        } catch (error) {
          console.error('获取用户计划失败:', error);
        }
      }
    };
    fetchUserPlan();
  }, [currentUser]);

  // 检查是否有待恢复的 pack（从登录/升级页面返回）
  useEffect(() => {
    const pendingPackId = sessionStorage.getItem('pendingPackId');
    if (pendingPackId) {
      sessionStorage.removeItem('pendingPackId');
      // 跳转到预览页面
      navigate(`/weekly-pack/preview/${pendingPackId}`);
    }
  }, [navigate]);

  const currentWeek = Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

  const handleGenerate = async () => {
    if (!childName || !age || !theme) {
      alert('Please fill in all fields');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Call backend API to generate weekly pack
      const response = await fetch(`${API_BASE_URL}/api/weekly-pack/generate-pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childName,
          age,
          theme
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate weekly pack');
      }

      const data = await response.json();
      
      if (data.success && data.pages) {
        // Add full image URLs
        const pagesWithFullUrl = data.pages.map((page: GeneratedPage) => ({
          ...page,
          imageUrl: getAssetUrl(page.imageUrl)
        }));
        
        setGeneratedPages(pagesWithFullUrl);
        setShowPreview(true);

        // Auto-save pack to get share link
        try {
          const saveResponse = await fetch(`${API_BASE_URL}/api/weekly-pack/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              childName,
              age,
              theme,
              weekNumber: currentWeek,
              pages: data.pages, // 使用原始 URL
              userId: currentUser?.uid
            })
          });
          const saveData = await saveResponse.json();
          if (saveData.success && saveData.packId) {
            setPackId(saveData.packId);
          }
        } catch (saveErr) {
          console.error('保存 pack 失败:', saveErr);
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate weekly pack');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTheme = THEMES.find(t => t.id === theme);

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-duck-yellow/30 via-white to-duck-blue/30 relative overflow-hidden">
        {/* 背景动画元素 */}
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
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        
        <motion.div 
          className="text-center z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 bg-duck-blue/20 rounded-full animate-ping" />
            <div className="absolute inset-2 bg-duck-yellow/30 rounded-full animate-pulse" />
            <Loader className="w-24 h-24 text-duck-blue" />
          </motion.div>
          
          <motion.h2 
            className="text-4xl font-display font-bold text-black mb-3"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Crafting {childName}'s Pack...
          </motion.h2>
          <p className="text-slate-600 font-mono text-lg">✨ Generating 10-20 personalized pages</p>
          
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

  // 错误页面
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-duck-yellow/20 to-duck-blue/20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-3xl font-display font-bold text-red-600 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-slate-600 font-mono mb-6">{error}</p>
          <button
            onClick={() => {
              setError('');
              setShowPreview(false);
            }}
            className="brutal-btn bg-duck-blue text-black border-3 border-black px-6 py-3 font-bold rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-duck-green/10 via-white to-duck-blue/10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-duck-green border-3 border-black px-6 py-3 rounded-full font-bold mb-6 shadow-brutal"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <Package size={24} />
              Week {currentWeek} Ready! • {generatedPages.length} Pages
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-black mb-4">
              {childName}'s Weekly Learning Pack
            </h1>
            <p className="text-xl text-slate-600 font-mono flex items-center justify-center gap-2">
              {selectedTheme && (
                <img src={selectedTheme.image} alt={selectedTheme.name} className="w-8 h-8 object-contain" />
              )}
              {selectedTheme?.name} Theme • {age} years
            </p>
          </motion.div>

          {/* Preview Grid - 显示真正生成的页面 */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {generatedPages.map((page, index) => (
              <motion.div
                key={page.order}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.08, type: "spring", bounce: 0.4 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white border-3 border-black rounded-2xl p-4 shadow-brutal hover:shadow-brutal-lg transition-all cursor-pointer group"
              >
                <div className="aspect-[8.5/11] bg-slate-100 rounded-xl mb-3 overflow-hidden relative border-2 border-slate-200">
                  {page.imageUrl ? (
                    <img 
                      src={page.imageUrl} 
                      alt={page.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Loader className="w-8 h-8 animate-spin" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {page.order}
                  </div>
                </div>
                <h3 className="font-display font-bold text-sm mb-1 truncate">{page.title}</h3>
                <p className="text-xs text-slate-500 font-mono capitalize">{page.type.replace(/-/g, ' ')}</p>
              </motion.div>
            ))}
          </div>

          {/* Download Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border-4 border-black rounded-3xl shadow-brutal-lg p-8 md:p-10"
          >
            <h2 className="text-3xl font-display font-bold mb-8 text-center flex items-center justify-center gap-3">
              <Star className="text-duck-yellow" />
              Unlock Full Pack
              <Star className="text-duck-yellow" />
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: '🎨', title: 'Color Version', desc: 'Full color printing', bg: 'bg-duck-yellow/20' },
                { icon: '✨', title: 'High Quality', desc: 'Print-ready 300 DPI', bg: 'bg-duck-blue/20' },
                { icon: '📎', title: 'Binder Ready', desc: '3-hole punch margins', bg: 'bg-duck-green/20' }
              ].map((option, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className={`${option.bg} border-3 border-black rounded-2xl p-5 text-center cursor-pointer hover:shadow-brutal transition-all`}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <div className="font-bold text-lg">{option.title}</div>
                  <div className="text-sm text-slate-600">{option.desc}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Share Button */}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (packId) {
                    const shareUrl = `${window.location.origin}/#/weekly-pack/preview/${packId}`;
                    try {
                      await navigator.clipboard.writeText(shareUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch (err) {
                      console.error('复制失败:', err);
                    }
                  }
                }}
                disabled={!packId}
                className="flex-1 bg-gradient-to-r from-duck-yellow to-duck-yellow/80 text-black border-3 border-black text-xl px-8 py-5 font-bold shadow-brutal-lg rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check size={24} />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Share2 size={24} />
                    Share Pack
                  </>
                )}
              </motion.button>

              {/* Download Button */}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isDownloading}
                onClick={async () => {
                  if (!currentUser) {
                    // 未登录用户 - 保存 packId 到 sessionStorage，跳转到登录页面
                    if (packId) {
                      sessionStorage.setItem('pendingPackId', packId);
                    }
                    navigate('/login');
                  } else if (userPlan === 'Pro') {
                    // Pro 用户 - 使用 jsPDF 在前端生成 PDF
                    setIsDownloading(true);
                    try {
                      // 获取用户打印设置
                      const { getPrintSettings, getDefaultPrintSettings } = await import('../services/firestoreService');
                      let printSettings = getDefaultPrintSettings();
                      try {
                        const userSettings = await getPrintSettings(currentUser.uid);
                        if (userSettings) printSettings = userSettings;
                      } catch (e) {
                        console.log('使用默认打印设置');
                      }

                      const isA4 = printSettings.paperSize === 'a4';
                      const pageWidth = isA4 ? 210 : 215.9;
                      const pageHeight = isA4 ? 297 : 279.4;

                      const { jsPDF } = await import('jspdf');
                      const pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: isA4 ? 'a4' : 'letter'
                      });

                      for (let i = 0; i < generatedPages.length; i++) {
                        if (i > 0) {
                          pdf.addPage();
                        }

                        const img = new Image();
                        img.crossOrigin = 'anonymous';

                        await new Promise<void>((resolve, reject) => {
                          img.onload = () => resolve();
                          img.onerror = reject;
                          img.src = generatedPages[i].imageUrl;
                        });

                        // Letter 图片适配不同纸张：
                        // - Letter 纸：以宽度为准，完美适配
                        // - A4 纸：以高度为准，左右均匀裁剪
                        const imgRatio = img.width / img.height;
                        let imgWidth: number, imgHeight: number, x: number, y: number;
                        
                        if (isA4) {
                          imgHeight = pageHeight;
                          imgWidth = pageHeight * imgRatio;
                          x = (pageWidth - imgWidth) / 2;
                          y = 0;
                        } else {
                          imgWidth = pageWidth;
                          imgHeight = pageWidth / imgRatio;
                          x = 0;
                          y = 0;
                        }

                        pdf.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
                      }

                      pdf.save(`${childName}_weekly_pack_week${currentWeek}.pdf`);

                      // 记录下载（不影响下载成功）
                      try {
                        await recordDownload(
                          currentUser.uid,
                          childName,
                          theme,
                          generatedPages.length,
                          packId
                        );
                        // 触发下载完成事件，通知 Dashboard 更新
                        window.dispatchEvent(new Event('downloadComplete'));
                      } catch (recordError) {
                        console.error('记录下载失败:', recordError);
                        // 不显示错误，因为 PDF 已经下载成功
                      }
                    } catch (error) {
                      console.error('下载错误:', error);
                      alert('下载失败，请重试');
                    } finally {
                      setIsDownloading(false);
                    }
                  } else {
                    // Free 用户 - 保存 packId 到 sessionStorage，跳转到订阅页面升级
                    if (packId) {
                      sessionStorage.setItem('pendingPackId', packId);
                    }
                    navigate('/pricing');
                  }
                }}
                className="flex-1 bg-gradient-to-r from-duck-blue to-duck-blue/80 text-black border-3 border-black text-xl px-8 py-5 font-bold shadow-brutal-lg rounded-2xl flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader size={24} className="animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={24} className="group-hover:animate-bounce" />
                    {!currentUser ? 'Login to Download' : userPlan === 'Pro' ? 'Download Full Pack' : 'Upgrade to Pro'}
                  </>
                )}
              </motion.button>
            </div>

            <p className="text-center text-sm text-slate-600 font-mono">
              {!currentUser 
                ? 'Login first, then upgrade to Pro' 
                : userPlan === 'Pro' 
                  ? '✨ Pro member • Unlimited downloads' 
                  : 'Upgrade to Pro to download • $4.99/month'}
            </p>
          </motion.div>

          {/* POD Option - Print on Demand */}
          <div className="mt-8">
            <PODOption childName={childName} weekNumber={currentWeek} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-duck-yellow/20 via-white to-duck-blue/20 py-16 px-4 relative overflow-hidden">
      {/* 浮动装饰元素 */}
      <FloatingElement delay={0} className="top-20 left-10 text-5xl opacity-60">🦕</FloatingElement>
      <FloatingElement delay={0.5} className="top-40 right-16 text-4xl opacity-50">🚀</FloatingElement>
      <FloatingElement delay={1} className="bottom-32 left-20 text-4xl opacity-50">🦄</FloatingElement>
      <FloatingElement delay={1.5} className="bottom-20 right-10 text-5xl opacity-60">🌟</FloatingElement>
      <FloatingElement delay={2} className="top-60 left-1/4 text-3xl opacity-40">✨</FloatingElement>
      
      <div className="max-w-4xl mx-auto relative z-10">
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
            <Calendar size={20} />
            Week {currentWeek}
            <Zap size={16} className="text-duck-yellow" />
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-display font-black text-black mb-4 leading-tight">
            Generate This Week's
            <br />
            <motion.span 
              className="text-duck-orange inline-block"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Learning Pack
            </motion.span>
          </h1>
          
          <p className="text-xl text-slate-600 font-mono flex items-center justify-center gap-2">
            <Heart size={18} className="text-red-400" />
            10-20 personalized pages delivered every Sunday
          </p>
        </motion.div>

        {/* Form Sections - Each in separate card */}
        <div className="space-y-6">
          {/* Step 1: Child Name Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-white border-4 rounded-3xl shadow-brutal p-6 md:p-8 transition-all ${
              childName ? 'border-duck-green' : 'border-black'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-duck-yellow border-3 border-black rounded-full flex items-center justify-center font-bold text-lg">1</div>
              <label className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Child's Name 
                <span className="text-duck-orange">*</span>
              </label>
              {childName && <span className="ml-auto text-2xl">✅</span>}
            </div>
            <div className="relative">
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Enter your child's name..."
                className="w-full px-6 py-4 text-xl font-display border-3 border-black rounded-2xl focus:ring-4 focus:ring-duck-yellow/50 focus:border-duck-yellow focus:outline-none transition-all bg-slate-50"
              />
            </div>
          </motion.div>

          {/* Step 2: Age Selection Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-white border-4 rounded-3xl shadow-brutal p-6 md:p-8 transition-all ${
              age ? 'border-duck-green' : 'border-black'
            }`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-duck-blue border-3 border-black rounded-full flex items-center justify-center font-bold text-lg">2</div>
              <label className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">🎂</span>
                Age 
                <span className="text-duck-orange">*</span>
              </label>
              {age && <span className="ml-auto text-2xl">✅</span>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AGES.map((ageOption, index) => (
                <motion.button
                  key={ageOption.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAge(ageOption.value)}
                  className={`px-4 py-4 border-3 border-black rounded-2xl font-bold transition-all ${
                    age === ageOption.value
                      ? 'bg-duck-yellow shadow-brutal scale-105 border-duck-yellow'
                      : 'bg-slate-50 hover:bg-white hover:shadow-brutal-sm'
                  }`}
                >
                  <div className="text-3xl mb-1">{ageOption.icon}</div>
                  <div className="text-sm font-bold">{ageOption.label}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Step 3: Theme Selection Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`bg-white border-4 rounded-3xl shadow-brutal p-6 md:p-8 transition-all ${
              theme ? 'border-duck-green' : 'border-black'
            }`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-duck-orange border-3 border-black rounded-full flex items-center justify-center font-bold text-lg text-white">3</div>
              <label className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">🎨</span>
                Weekly Theme 
                <span className="text-duck-orange">*</span>
              </label>
              {theme && <span className="ml-auto text-2xl">✅</span>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {THEMES.map((themeOption, index) => (
                <motion.button
                  key={themeOption.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + index * 0.05, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme(themeOption.id)}
                  className={`relative px-4 py-5 border-3 rounded-2xl font-bold transition-all overflow-hidden ${
                    theme === themeOption.id
                      ? 'shadow-brutal scale-105 border-black'
                      : 'bg-slate-50 border-slate-200 hover:border-black hover:shadow-brutal-sm'
                  }`}
                  style={{
                    backgroundColor: theme === themeOption.id ? `${themeOption.color}50` : undefined
                  }}
                >
                  {theme === themeOption.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 text-xl"
                    >
                      ✓
                    </motion.div>
                  )}
                  <div className="relative z-10">
                    <motion.div 
                      className="w-16 h-16 mx-auto mb-2 flex items-center justify-center"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <img 
                        src={themeOption.image} 
                        alt={themeOption.name}
                        className="max-w-full max-h-full object-contain drop-shadow-md"
                      />
                    </motion.div>
                    <div className="text-sm font-bold">{themeOption.name}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Generate Button Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-duck-green/20 to-duck-blue/20 border-4 border-black rounded-3xl shadow-brutal-lg p-6 md:p-8"
          >
            <div className="text-center mb-4">
              <p className="text-slate-600 font-mono">
                {!childName && !age && !theme && '👆 Fill in all fields above to continue'}
                {childName && !age && !theme && '✅ Name done! Now select age'}
                {childName && age && !theme && '✅ Almost there! Pick a theme'}
                {childName && age && theme && '🎉 All set! Ready to generate!'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: childName && age && theme ? 1.02 : 1, y: childName && age && theme ? -2 : 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={!childName || !age || !theme}
              className="w-full bg-gradient-to-r from-duck-green to-duck-green/80 text-black border-4 border-black text-xl px-8 py-6 font-bold shadow-brutal-lg rounded-2xl flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none group relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
              <Sparkles size={28} className="group-hover:rotate-12 transition-transform relative z-10" />
              <span className="relative z-10">Generate This Week's Pack</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mt-10"
        >
          {[
            { icon: '📦', title: '10-20 Pages', desc: 'Full week of learning', color: 'from-duck-yellow/30' },
            { icon: '🎨', title: 'Themed Content', desc: 'Based on interests', color: 'from-duck-blue/30' },
            { icon: '📅', title: 'Every Sunday', desc: 'Auto-delivered', color: 'from-duck-green/30' }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.03 }}
              className={`bg-gradient-to-br ${feature.color} to-white border-3 border-black rounded-2xl p-6 text-center shadow-brutal-sm hover:shadow-brutal transition-all cursor-pointer`}
            >
              <motion.div 
                className="text-5xl mb-3"
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                {feature.icon}
              </motion.div>
              <div className="font-bold text-lg mb-1">{feature.title}</div>
              <div className="text-sm text-slate-600 font-mono">{feature.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default WeeklyPack;
