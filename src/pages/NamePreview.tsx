import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Sparkles, ArrowRight, Loader } from 'lucide-react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { generateWorksheet } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const THEMES = [
  { id: 'dinosaur', name: 'Dinosaurs', image: 'http://localhost:3000/uploads/assets/A_main_assets/dinosaur/color/main/dinosaur_000_color.png', color: '#a1e44d' },
  { id: 'space', name: 'Space', image: 'http://localhost:3000/uploads/assets/A_main_assets/space/color/main/space_000_color.png', color: '#7bd3ea' },
  { id: 'vehicles', name: 'Cars', image: 'http://localhost:3000/uploads/assets/A_main_assets/vehicles/color/main/vehicles_000_color.png', color: '#ff9f1c' },
  { id: 'unicorn', name: 'Unicorn', image: 'http://localhost:3000/uploads/assets/A_main_assets/unicorn/color/main/unicorn_000_color.png', color: '#ff99c8' },
  { id: 'ocean', name: 'Ocean', image: 'http://localhost:3000/uploads/assets/A_main_assets/ocean/color/main/ocean_000_color.png', color: '#7bd3ea' },
  { id: 'safari', name: 'Safari', image: 'http://localhost:3000/uploads/assets/A_main_assets/safari/color/main/safari_000_color.png', color: '#ffd60a' }
];

const NamePreview: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const decodedName = name ? decodeURIComponent(name) : 'Child';
  const capitalizedName = decodedName.charAt(0).toUpperCase() + decodedName.slice(1).toLowerCase();

  // 调用后端生成 Write My Name 页面
  const generateWriteMyNamePage = async (themeName: string) => {
    setIsGenerating(true);
    setError('');
    
    try {
      const result = await generateWorksheet({
        category: 'literacy',
        type: 'write-my-name',
        config: {
          theme: themeName,
          name: capitalizedName
        }
      });

      if (result.success && result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setError('Failed to generate worksheet');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to connect to server');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // 默认使用恐龙主题生成
    generateWriteMyNamePage('dinosaur');
  }, [capitalizedName]);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadFree = async () => {
    if (!generatedImageUrl || isDownloading) return;

    setIsDownloading(true);

    try {
      // 创建一个 Image 对象来加载图片
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = generatedImageUrl;
      });

      // 创建 PDF (A4 尺寸)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // A4 尺寸: 210mm x 297mm
      const pageWidth = 210;
      const pageHeight = 297;

      // 计算图片在 PDF 中的尺寸，保持比例
      const imgRatio = img.width / img.height;
      const pageRatio = pageWidth / pageHeight;

      let imgWidth, imgHeight;
      if (imgRatio > pageRatio) {
        // 图片更宽，以宽度为准
        imgWidth = pageWidth;
        imgHeight = pageWidth / imgRatio;
      } else {
        // 图片更高，以高度为准
        imgHeight = pageHeight;
        imgWidth = pageHeight * imgRatio;
      }

      // 居中放置
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      // 添加图片到 PDF
      pdf.addImage(img, 'PNG', x, y, imgWidth, imgHeight);

      // 下载 PDF
      pdf.save(`${capitalizedName}-write-my-name.pdf`);

      // Show success message
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGetFullPack = () => {
    // 已登录用户跳转到周报生成页面，未登录用户跳转到登录页面
    if (currentUser) {
      navigate('/weekly-pack');
    } else {
      navigate('/login');
    }
  };

  const handleThemeChange = (theme: typeof THEMES[0]) => {
    setSelectedTheme(theme);
    generateWriteMyNamePage(theme.id);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-duck-yellow/20 to-duck-blue/20">
        <div className="text-center">
          <Loader className="w-16 h-16 animate-spin mx-auto mb-4 text-duck-blue" />
          <h2 className="text-3xl font-display font-bold text-black mb-2">
            Creating magic for {capitalizedName}...
          </h2>
          <p className="text-slate-600 font-mono">✨ Generating personalized worksheet</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-duck-yellow/20 to-duck-blue/20">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-red-600 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-slate-600 font-mono mb-4">{error}</p>
          <button
            onClick={() => generateWriteMyNamePage(selectedTheme.id)}
            className="brutal-btn bg-duck-blue text-black border-3 border-black px-6 py-3 font-bold rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-duck-yellow border-2 border-black px-4 py-2 rounded-full font-bold mb-4">
            <Sparkles size={20} />
            Designed for {capitalizedName}
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-black mb-4">
            Your Free Write My Name Page
          </h1>
          <p className="text-xl text-slate-600 font-mono">
            This is Page 1 of {capitalizedName}'s Weekly Pack
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Preview - 占3列，更大的预览区域 */}
          <div className="md:col-span-3 flex justify-center">
            {generatedImageUrl ? (
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" style={{ maxWidth: '500px' }}>
                <img
                  src={generatedImageUrl}
                  alt={`${capitalizedName}'s Write My Name Page`}
                  className="w-full h-auto"
                  style={{ display: 'block' }}
                />
              </div>
            ) : (
              <div className="w-full max-w-md h-[600px] flex items-center justify-center border-4 border-black bg-slate-50">
                <p className="text-slate-400">No image generated</p>
              </div>
            )}
          </div>

          {/* Controls - 占2列 */}
          <div className="md:col-span-2 space-y-6">
            {/* Theme Selector */}
            <div className="bg-white border-4 border-black rounded-2xl shadow-brutal p-6">
              <h3 className="text-2xl font-display font-bold mb-4 text-center">Choose Theme</h3>
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme)}
                    className={`p-3 border-3 border-black rounded-xl transition-all ${
                      selectedTheme.id === theme.id
                        ? 'bg-duck-yellow shadow-brutal scale-105'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                      <img 
                        src={theme.image} 
                        alt={theme.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="text-sm font-bold">{theme.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="bg-white border-4 border-black rounded-2xl shadow-brutal p-6 space-y-4">
              <button
                onClick={handleDownloadFree}
                disabled={isDownloading}
                className="w-full brutal-btn bg-duck-green text-black border-3 border-black text-lg px-6 py-4 font-bold shadow-brutal rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <Loader className="animate-spin" size={24} />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download size={24} />
                    Download Free PDF
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500 font-mono">or</span>
                </div>
              </div>

              <button
                onClick={handleGetFullPack}
                className="w-full brutal-btn bg-duck-blue text-black border-3 border-black text-lg px-6 py-4 font-bold shadow-brutal rounded-xl flex items-center justify-center gap-3 group"
              >
                Get Full Weekly Pack
                <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
              </button>

              <div className="bg-duck-yellow/20 border-2 border-duck-yellow rounded-xl p-4">
                <p className="text-sm font-mono text-center">
                  <strong>Full Pack includes:</strong> 10-20 pages • Auto-delivery every Sunday • All themes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default NamePreview;
