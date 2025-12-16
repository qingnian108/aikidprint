import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Share2, Check, Loader, Package, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, recordDownload, getPrintSettings } from '../services/firestoreService';
import { API_BASE_URL, getAssetUrl } from '../config/api';

interface GeneratedPage {
  order: number;
  type: string;
  title: string;
  imageUrl: string;
}

interface CustomPackData {
  id: string;
  theme: string;
  selections: Record<string, number>;
  pages: GeneratedPage[];
  createdAt: Date;
  totalPages: number;
}

// 打乱页面顺序，避免相同类型挨着
const shufflePages = (pages: GeneratedPage[]): GeneratedPage[] => {
  if (pages.length <= 2) return pages;
  
  const result: GeneratedPage[] = [];
  const remaining = [...pages];
  
  // 按类型分组
  const byType: Record<string, GeneratedPage[]> = {};
  remaining.forEach(page => {
    if (!byType[page.type]) byType[page.type] = [];
    byType[page.type].push(page);
  });
  
  // 交替从不同类型中取出
  const types = Object.keys(byType);
  let typeIndex = 0;
  
  while (Object.values(byType).some(arr => arr.length > 0)) {
    // 找到下一个有内容的类型
    let attempts = 0;
    while (byType[types[typeIndex]]?.length === 0 && attempts < types.length) {
      typeIndex = (typeIndex + 1) % types.length;
      attempts++;
    }
    
    const currentType = types[typeIndex];
    if (byType[currentType]?.length > 0) {
      result.push(byType[currentType].shift()!);
    }
    
    typeIndex = (typeIndex + 1) % types.length;
  }
  
  // 重新编号
  return result.map((page, idx) => ({ ...page, order: idx + 1 }));
};

const CustomPackPreview: React.FC = () => {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [packData, setPackData] = useState<CustomPackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userPlan, setUserPlan] = useState<'Free' | 'Pro'>('Free');
  const [paperSize, setPaperSize] = useState<'letter' | 'a4'>('letter');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 获取用户订阅计划和打印设置
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (currentUser) {
        // 分开获取，避免一个失败影响另一个
        try {
          const userData = await getUserData(currentUser.uid);
          if (userData) {
            setUserPlan(userData.plan);
          }
        } catch (error) {
          console.error('获取用户计划失败:', error);
        }
        
        try {
          const printSettings = await getPrintSettings(currentUser.uid);
          if (printSettings) {
            setPaperSize(printSettings.paperSize);
            console.log('[CustomPackPreview] Paper size:', printSettings.paperSize);
          }
        } catch (error) {
          console.error('获取打印设置失败，使用默认 letter:', error);
          // 失败时保持默认值 letter
        }
      }
    };
    fetchUserSettings();
  }, [currentUser]);

  // 获取 pack 数据
  useEffect(() => {
    const fetchPackData = async () => {
      if (!packId) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/custom-pack/${packId}`);
        const data = await response.json();
        
        if (data.success && data.pack) {
          // 添加完整的图片 URL
          const packWithFullUrls = {
            ...data.pack,
            pages: data.pack.pages.map((page: GeneratedPage) => ({
              ...page,
              imageUrl: getAssetUrl(page.imageUrl)
            }))
          };
          setPackData(packWithFullUrls);
        } else {
          setError('Pack not found');
        }
      } catch (err) {
        console.error('Failed to fetch pack:', err);
        setError('Failed to load pack');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPackData();
  }, [packId]);

  // 下载处理
  const handleDownload = async () => {
    if (!packData) return;
    
    if (!currentUser) {
      sessionStorage.setItem('pendingCustomPackId', packId || '');
      navigate('/login');
      return;
    }
    
    if (userPlan !== 'Pro') {
      sessionStorage.setItem('pendingCustomPackId', packId || '');
      navigate('/pricing');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      const { jsPDF } = await import('jspdf');
      
      // 根据用户设置选择纸张大小
      const isA4 = paperSize === 'a4';
      const pageWidth = isA4 ? 210 : 215.9;  // A4: 210mm, Letter: 215.9mm
      const pageHeight = isA4 ? 297 : 279.4; // A4: 297mm, Letter: 279.4mm
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: isA4 ? 'a4' : 'letter'
      });

      for (let i = 0; i < packData.pages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = packData.pages[i].imageUrl;
        });

        // Letter 图片适配不同纸张：
        // - Letter 纸：以宽度为准，完美适配
        // - A4 纸：以高度为准，左右均匀裁剪
        const imgRatio = img.width / img.height;
        let imgWidth: number, imgHeight: number, x: number, y: number;
        
        if (isA4) {
          // A4 更窄更长，以高度为准，左右均匀裁剪
          imgHeight = pageHeight;
          imgWidth = pageHeight * imgRatio;
          x = (pageWidth - imgWidth) / 2; // 左右居中（负值表示裁剪）
          y = 0;
        } else {
          // Letter 完美适配
          imgWidth = pageWidth;
          imgHeight = pageWidth / imgRatio;
          x = 0;
          y = 0;
        }

        pdf.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
      }

      pdf.save(`custom_pack_${packId}.pdf`);

      // 记录下载
      try {
        await recordDownload(
          currentUser.uid,
          'Custom Pack',
          packData.theme,
          packData.pages.length,
          packId
        );
        window.dispatchEvent(new Event('downloadComplete'));
      } catch (recordError) {
        console.error('记录下载失败:', recordError);
      }
    } catch (error) {
      console.error('下载错误:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  // 分享处理
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/#/custom-pack/preview/${packId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-duck-yellow/20 to-duck-blue/20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="w-16 h-16 text-duck-blue" />
        </motion.div>
      </div>
    );
  }

  // 错误状态
  if (error || !packData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-duck-yellow/20 to-duck-blue/20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-3xl font-display font-bold text-red-600 mb-2">
            Pack Not Found
          </h2>
          <p className="text-slate-600 font-mono mb-6">{error || 'This pack does not exist or has been removed.'}</p>
          <button
            onClick={() => navigate('/custom-pack')}
            className="brutal-btn bg-duck-blue text-black border-3 border-black px-6 py-3 font-bold rounded-xl"
          >
            Create New Pack
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-duck-green/10 via-white to-duck-blue/10 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 返回按钮 */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/custom-pack')}
          className="flex items-center gap-2 font-bold text-black hover:underline mb-8"
        >
          <ArrowLeft size={20} />
          Create Another Pack
        </motion.button>

        {/* Header */}
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
            Custom Pack Ready! • {packData.pages.length} Pages
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-black mb-4">
            Your Custom Learning Pack
          </h1>
          <p className="text-xl text-slate-600 font-mono">
            {packData.theme.charAt(0).toUpperCase() + packData.theme.slice(1)} Theme
          </p>
        </motion.div>

        {/* Preview Grid - 2 columns, shuffled to avoid same types adjacent */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          {shufflePages(packData.pages).map((page, index) => (
            <motion.div
              key={page.order}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05, type: "spring", bounce: 0.4 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white border-3 border-black rounded-2xl p-3 shadow-brutal hover:shadow-brutal-lg transition-all cursor-pointer group"
            >
              <div className="aspect-[8.5/11] bg-slate-100 rounded-xl mb-2 overflow-hidden relative border-2 border-slate-200">
                <img 
                  src={page.imageUrl} 
                  alt={page.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {page.order}
                </div>
              </div>
              <h3 className="font-display font-bold text-sm truncate">{page.title}</h3>
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
            Download Your Pack
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
              onClick={handleShare}
              className="flex-1 bg-gradient-to-r from-duck-yellow to-duck-yellow/80 text-black border-3 border-black text-xl px-8 py-5 font-bold shadow-brutal-lg rounded-2xl flex items-center justify-center gap-3"
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
              onClick={handleDownload}
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
      </div>
    </div>
  );
};

export default CustomPackPreview;
