import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Loader, Package, Star, Share2, Check, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, recordDownload } from '../services/firestoreService';
import PODOption from '../components/PODOption';
import { API_BASE_URL, getAssetUrl } from '../config/api';

const THEMES = [
  { id: 'dinosaur', name: 'Dinosaurs', image: getAssetUrl('/uploads/assets/B_character_ip/dinosaur/icon/dinosaur_icon.png'), color: '#a1e44d' },
  { id: 'space', name: 'Space', image: getAssetUrl('/uploads/assets/B_character_ip/space/icon/space_astronaut_icon.png'), color: '#7bd3ea' },
  { id: 'vehicles', name: 'Cars', image: getAssetUrl('/uploads/assets/B_character_ip/vehicles/icon/vehicles_car_icon.png'), color: '#ff9f1c' },
  { id: 'unicorn', name: 'Unicorn', image: getAssetUrl('/uploads/assets/B_character_ip/unicorn/icon/unicorn_icon.png'), color: '#ff99c8' },
  { id: 'ocean', name: 'Ocean', image: getAssetUrl('/uploads/assets/B_character_ip/ocean/icon/ocean_whale_icon.png'), color: '#7bd3ea' },
  { id: 'safari', name: 'Safari', image: getAssetUrl('/uploads/assets/B_character_ip/safari/icon/safari_lion_icon.png'), color: '#ffd60a' }
];

interface GeneratedPage {
  order: number;
  type: string;
  title: string;
  imageUrl: string;
}

interface PackData {
  packId: string;
  childName: string;
  age: string;
  theme: string;
  weekNumber: number;
  pages: GeneratedPage[];
  createdAt: string;
}

const WeeklyPackPreview: React.FC = () => {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [packData, setPackData] = useState<PackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userPlan, setUserPlan] = useState<'Free' | 'Pro'>('Free');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 获取用户订阅计划
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (currentUser) {
        try {
          const userData = await getUserData(currentUser.uid);
          if (userData) {
            setUserPlan(userData.plan);
          }
        } catch (err) {
          console.error('获取用户计划失败:', err);
        }
      }
    };
    fetchUserPlan();
  }, [currentUser]);

  // 加载 pack 数据
  useEffect(() => {
    const fetchPack = async () => {
      if (!packId) {
        setError('Invalid pack ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/weekly-pack/pack/${packId}`);
        const data = await response.json();

        if (data.success && data.pack) {
          // Add full image URLs
          const pagesWithFullUrl = data.pack.pages.map((page: GeneratedPage) => ({
            ...page,
            imageUrl: getAssetUrl(page.imageUrl)
          }));
          setPackData({ ...data.pack, pages: pagesWithFullUrl });
        } else {
          setError(data.error || 'Pack not found');
        }
      } catch (err) {
        console.error('加载 pack 失败:', err);
        setError('Failed to load pack');
      } finally {
        setLoading(false);
      }
    };

    fetchPack();
  }, [packId]);

  // 清除 sessionStorage 中的 pendingPackId
  useEffect(() => {
    sessionStorage.removeItem('pendingPackId');
  }, []);

  const selectedTheme = packData ? THEMES.find(t => t.id === packData.theme) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-duck-yellow/30 via-white to-duck-blue/30">
        <motion.div className="text-center">
          <Loader className="w-16 h-16 text-duck-blue animate-spin mx-auto mb-4" />
          <p className="text-xl font-mono text-slate-600">Loading pack...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !packData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-duck-yellow/20 to-duck-blue/20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-3xl font-display font-bold text-red-600 mb-2">
            Pack Not Found
          </h2>
          <p className="text-slate-600 font-mono mb-6">{error || 'This pack may have expired or been deleted.'}</p>
          <button
            onClick={() => navigate('/weekly-pack')}
            className="brutal-btn bg-duck-blue text-black border-3 border-black px-6 py-3 font-bold rounded-xl"
          >
            Create Your Own Pack
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-duck-green/10 via-white to-duck-blue/10 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/weekly-pack')}
          className="flex items-center gap-2 text-slate-600 hover:text-black mb-6 font-mono"
        >
          <ArrowLeft size={20} />
          Create New Pack
        </motion.button>

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
            Week {packData.weekNumber} • {packData.pages.length} Pages
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-black mb-4">
            {packData.childName}'s Weekly Learning Pack
          </h1>
          <p className="text-xl text-slate-600 font-mono flex items-center justify-center gap-2">
            {selectedTheme && (
              <img src={selectedTheme.image} alt={selectedTheme.name} className="w-8 h-8 object-contain" />
            )}
            {selectedTheme?.name} Theme • {packData.age} years
          </p>
        </motion.div>

        {/* Preview Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {packData.pages.map((page, index) => (
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
            Download Pack
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
                const shareUrl = `${window.location.origin}/#/weekly-pack/preview/${packId}`;
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                  console.error('复制失败:', err);
                }
              }}
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
              onClick={async () => {
                if (!currentUser) {
                  sessionStorage.setItem('pendingPackId', packId || '');
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

                    pdf.save(`${packData.childName}_weekly_pack_week${packData.weekNumber}.pdf`);

                    // 记录下载（不影响下载成功）
                    try {
                      await recordDownload(
                        currentUser.uid,
                        packData.childName,
                        packData.theme,
                        packData.pages.length,
                        packId
                      );
                      // 触发下载完成事件，通知 Dashboard 更新
                      window.dispatchEvent(new CustomEvent('downloadComplete'));
                    } catch (recordError) {
                      console.error('记录下载失败:', recordError);
                      // 不显示错误，因为 PDF 已经下载成功
                    }
                  } catch (err) {
                    console.error('下载错误:', err);
                    alert('下载失败，请重试');
                  } finally {
                    setIsDownloading(false);
                  }
                } else {
                  sessionStorage.setItem('pendingPackId', packId || '');
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
          <PODOption childName={packData.childName} weekNumber={packData.weekNumber} />
        </div>
      </div>
    </div>
  );
};

export default WeeklyPackPreview;
