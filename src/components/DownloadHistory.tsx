import React, { useState, useEffect } from 'react';
import { Download, Calendar, FileText, Loader, RefreshCw, Package, FileImage, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recordDownload, getUserDownloadRecords, DownloadRecord, getPrintSettings, getDefaultPrintSettings } from '../services/firestoreService';
import { API_BASE_URL, getAssetUrl } from '../config/api';

interface PackPage {
  order: number;
  type: string;
  title: string;
  imageUrl: string;
}

interface WeeklyPack {
  packId: string;
  childName: string;
  age: string;
  theme: string;
  weekNumber: number;
  pages: PackPage[];
  createdAt: string;
  createdBy?: string;
  source?: 'manual' | 'auto'; // manual = user created, auto = auto delivery
}

// Theme image URLs
const THEME_IMAGES: Record<string, string> = {
  dinosaur: getAssetUrl('/uploads/assets/A_main_assets/dinosaur/color/main/dinosaur_000_color.png'),
  space: getAssetUrl('/uploads/assets/A_main_assets/space/color/main/space_000_color.png'),
  ocean: getAssetUrl('/uploads/assets/A_main_assets/ocean/color/main/ocean_000_color.png'),
  safari: getAssetUrl('/uploads/assets/A_main_assets/safari/color/main/safari_000_color.png'),
  unicorn: getAssetUrl('/uploads/assets/A_main_assets/unicorn/color/main/unicorn_000_color.png'),
  vehicles: getAssetUrl('/uploads/assets/A_main_assets/vehicles/color/main/vehicles_000_color.png'),
  cars: getAssetUrl('/uploads/assets/A_main_assets/vehicles/color/main/vehicles_000_color.png'),
  default: ''
};

const DownloadHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [packs, setPacks] = useState<WeeklyPack[]>([]);
  const [worksheetRecords, setWorksheetRecords] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  // worksheet 名称到路径的映射
  const WORKSHEET_PATH_MAP: Record<string, { category: string; type: string }> = {
    'Maze': { category: 'fun', type: 'maze' },
    'Sorting': { category: 'math', type: 'sorting' },
    'Counting Objects': { category: 'math', type: 'counting-objects' },
    'Number Tracing': { category: 'math', type: 'number-tracing' },
    'Letter Tracing': { category: 'writing', type: 'letter-tracing' },
    'Uppercase Tracing': { category: 'writing', type: 'uppercase-tracing' },
    'Name Tracing': { category: 'writing', type: 'name-tracing' },
    'Dot to Dot': { category: 'fun', type: 'dot-to-dot' },
    'Pattern Sequencing': { category: 'math', type: 'pattern-sequencing' },
    'Picture Math': { category: 'math', type: 'picture-math' },
    'CVC Words': { category: 'reading', type: 'cvc-words' },
    'Sight Words': { category: 'reading', type: 'sight-words' },
    'Rhyming Words': { category: 'reading', type: 'rhyming-words' },
    'Coloring Page': { category: 'fun', type: 'coloring-page' },
  };

  // 处理重新生成 - 直接跳转到对应页面，使用默认配置
  const handleRegenerate = (record: DownloadRecord) => {
    let category = record.category;
    let type = record.type;
    
    // 如果没有 category/type，尝试从 childName（worksheet 名称）推断
    if (!category || !type) {
      const pathInfo = WORKSHEET_PATH_MAP[record.childName];
      if (pathInfo) {
        category = pathInfo.category;
        type = pathInfo.type;
      }
    }
    
    if (category && type) {
      navigate(`/generator/${category}/${type}`);
    } else {
      navigate('/generator');
    }
  };

  // 获取用户的历史数据
  const fetchHistory = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch Weekly Packs from backend (with timeout and error handling)
      let packsData: WeeklyPack[] = [];
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const packsResponse = await fetch(
          `${API_BASE_URL}/api/weekly-pack/user-packs/${currentUser.uid}`,
          { signal: controller.signal }
        ).then(r => r.json());
        
        clearTimeout(timeoutId);
        
        if (packsResponse.success) {
          packsData = packsResponse.packs || [];
        }
      } catch (packErr) {
        console.warn('Failed to fetch weekly packs from backend:', packErr);
        // Continue without backend data
      }
      
      setPacks(packsData);

      // Fetch single download records from Firestore/local storage
      try {
        const downloadRecords = await getUserDownloadRecords(currentUser.uid);
        // Filter out records with packId (those are pack downloads, not single worksheets)
        const singleDownloads = downloadRecords.filter(r => !r.packId);
        setWorksheetRecords(singleDownloads);
      } catch (recordErr) {
        console.warn('Failed to fetch download records:', recordErr);
        setWorksheetRecords([]);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
      // Don't show error if we at least have some data
      if (packs.length === 0 && worksheetRecords.length === 0) {
        setError('Failed to load history');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  // 下载 pack
  const handleDownloadPack = async (pack: WeeklyPack) => {
    setDownloading(pack.packId);

    try {
      // 获取用户的打印设置
      let printSettings = getDefaultPrintSettings();
      if (currentUser) {
        const userSettings = await getPrintSettings(currentUser.uid);
        if (userSettings) {
          printSettings = userSettings;
        }
      }

      // 根据纸张大小设置尺寸
      const isLetter = printSettings.paperSize === 'letter';
      const pageWidth = isLetter ? 215.9 : 210;   // Letter: 8.5", A4: 210mm
      const pageHeight = isLetter ? 279.4 : 297;  // Letter: 11", A4: 297mm
      
      // Binder Ready: 左侧留出 25mm (约 1 英寸) 用于打孔
      const binderMargin = printSettings.binderReady ? 25 : 0;
      const contentWidth = pageWidth - binderMargin;

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: printSettings.paperSize === 'letter' ? 'letter' : 'a4'
      });

      for (let i = 0; i < pack.pages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';

        const imageUrl = getAssetUrl(pack.pages[i].imageUrl);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = imageUrl;
        });

        // Letter 图片适配不同纸张：
        // - Letter 纸：以宽度为准，完美适配
        // - A4 纸：以高度为准，左右均匀裁剪
        const imgRatio = img.width / img.height;
        const isA4 = !isLetter;
        let imgWidth: number, imgHeight: number, x: number, y: number;
        
        if (isA4) {
          imgHeight = pageHeight;
          imgWidth = pageHeight * imgRatio;
          x = binderMargin + (contentWidth - imgWidth) / 2;
          y = 0;
        } else {
          imgWidth = contentWidth;
          imgHeight = contentWidth / imgRatio;
          x = binderMargin;
          y = 0;
        }

        pdf.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
      }

      // 文件名：自动推送带周数，手动创建不带
      const fileName = pack.source === 'auto'
        ? `${pack.childName}_Week${pack.weekNumber}_${pack.theme}.pdf`
        : `${pack.childName}_${pack.theme}_pack.pdf`;
      pdf.save(fileName);

      if (currentUser) {
        try {
          await recordDownload(currentUser.uid, pack.childName, pack.theme, pack.pages.length, pack.packId);
          window.dispatchEvent(new Event('downloadComplete'));
        } catch (e) {
          console.error('Failed to record download:', e);
        }
      }
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const getThemeImage = (theme: string): string => {
    return THEME_IMAGES[theme?.toLowerCase()] || THEME_IMAGES.dinosaur;
  };

  const formatDate = (dateValue: any): string => {
    try {
      if (dateValue?.toDate) {
        return format(dateValue.toDate(), 'MMM d, yyyy');
      }
      if (typeof dateValue === 'string') {
        return format(new Date(dateValue), 'MMM d, yyyy');
      }
      if (typeof dateValue === 'number') {
        return format(new Date(dateValue), 'MMM d, yyyy');
      }
      return 'Unknown date';
    } catch {
      return 'Unknown date';
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <div className="bg-white border-4 border-black rounded-2xl shadow-brutal p-8">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-duck-blue" />
          <span className="ml-3 font-mono text-slate-600">Loading history...</span>
        </div>
      </div>
    );
  }

  // 未登录状态
  if (!currentUser) {
    return (
      <div className="bg-white border-4 border-black rounded-2xl shadow-brutal p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-2xl font-display font-bold mb-2">Login Required</h3>
          <p className="text-slate-600 font-mono">Please login to view your download history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      {/* 左列：Weekly Packs */}
      <div className="bg-white border-4 border-black rounded-2xl shadow-brutal p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="text-duck-blue" size={24} />
            <div>
              <h2 className="text-2xl font-display font-bold">Weekly Packs</h2>
              <p className="text-slate-500 font-mono text-xs">Multi-page learning packs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchHistory} className="p-2 border-2 border-black rounded-lg hover:bg-slate-50">
              <RefreshCw size={16} />
            </button>
            <div className="bg-duck-blue border-2 border-black px-3 py-1 rounded-full font-bold text-sm">
              {packs.length}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 font-mono text-sm">
            {error}
          </div>
        )}

        {packs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-500 font-mono text-sm">No weekly packs yet</p>
            <a href="/#/weekly-pack" className="text-duck-blue font-bold text-sm hover:underline">
              Generate your first pack →
            </a>
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {packs.map((pack, index) => (
              <motion.div
                key={pack.packId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-2 border-black rounded-xl p-4 hover:shadow-brutal-sm transition-all ${
                  index === 0 ? 'bg-duck-yellow/10 ring-2 ring-duck-yellow' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img src={getThemeImage(pack.theme)} alt={pack.theme} className="w-10 h-10 object-contain" />
                    <div className="min-w-0">
                      <h3 className="font-bold truncate">
                        {pack.source === 'auto' 
                          ? `Week ${pack.weekNumber} - ${pack.theme.charAt(0).toUpperCase() + pack.theme.slice(1)}`
                          : `${pack.theme.charAt(0).toUpperCase() + pack.theme.slice(1)} Pack`
                        }
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(pack.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={12} />
                          {pack.pages.length} pages
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {index === 0 && (
                          <span className="inline-block bg-duck-yellow border border-black px-2 py-0.5 rounded-full text-xs font-bold">
                            ⭐ Latest
                          </span>
                        )}
                        {pack.source === 'auto' ? (
                          <span className="inline-block bg-duck-blue/20 border border-duck-blue px-2 py-0.5 rounded-full text-xs font-bold text-duck-blue">
                            📬 Auto Delivery
                          </span>
                        ) : (
                          <span className="inline-block bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full text-xs font-mono text-slate-500">
                            ✏️ Created
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadPack(pack)}
                    disabled={downloading === pack.packId}
                    className="brutal-btn border-2 border-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 bg-duck-green hover:bg-duck-blue disabled:opacity-50 whitespace-nowrap"
                  >
                    {downloading === pack.packId ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    {downloading === pack.packId ? '...' : 'Download'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 右列：Single Worksheets */}
      <div className="bg-white border-4 border-black rounded-2xl shadow-brutal p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileImage className="text-duck-pink" size={24} />
            <div>
              <h2 className="text-2xl font-display font-bold">Single Worksheets</h2>
              <p className="text-slate-500 font-mono text-xs">Individual page downloads</p>
            </div>
          </div>
          <div className="bg-duck-pink border-2 border-black px-3 py-1 rounded-full font-bold text-sm">
            {worksheetRecords.length}
          </div>
        </div>

        {worksheetRecords.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-slate-500 font-mono text-sm">No single worksheets yet</p>
            <a href="/#/generator" className="text-duck-blue font-bold text-sm hover:underline">
              Create a worksheet →
            </a>
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {worksheetRecords.map((record, index) => (
              <motion.div
                key={record.downloadId}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-2 border-black rounded-xl p-4 bg-white hover:shadow-brutal-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src={getThemeImage(record.theme)} alt={record.theme} className="w-10 h-10 object-contain" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{record.childName}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(record.downloadedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={12} />
                        {record.pageCount} page{record.pageCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      {record.theme || 'default'}
                    </div>
                    <button
                      onClick={() => handleRegenerate(record)}
                      className="brutal-btn border-2 border-black px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 bg-duck-blue hover:bg-duck-green whitespace-nowrap"
                      title="Regenerate worksheet with same settings"
                    >
                      <RotateCcw size={12} />
                      Regenerate
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadHistory;
