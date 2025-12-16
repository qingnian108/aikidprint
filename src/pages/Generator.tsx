import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Sparkles, Download, RefreshCw, ArrowLeft, Lock, Printer } from 'lucide-react';
import { AGES, TOPICS, THEMES, DIFFICULTIES } from '../constants';
import { WorksheetConfig, WorksheetType, DifficultyLevel, GeneratedPage } from '../types';
import { generateWorksheetContent } from '../services/geminiService';
import WorksheetRenderer from '../components/WorksheetRenderer';
import { useAuth } from '../contexts/AuthContext';
import QuotaModal from '../components/QuotaModal';
import { checkDailyQuota, recordUsage, getUserData, recordDownload } from '../services/firestoreService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Generator: React.FC = () => {
  const [step, setStep] = useState<'input' | 'loading' | 'preview'>('input');
  const [config, setConfig] = useState<WorksheetConfig>({
    age: 5,
    type: WorksheetType.MATH,
    theme: THEMES[0],
    difficulty: DifficultyLevel.EASY,
    pageCount: 1 // Default to 1 for free version demo
  });
  
  const [pages, setPages] = useState<GeneratedPage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [quotaTitle, setQuotaTitle] = useState('Limit Reached');
  const [quotaMessage, setQuotaMessage] = useState('');
  const [quotaActionText, setQuotaActionText] = useState<string | undefined>(undefined);
  const [exporting, setExporting] = useState(false);
  const pagesRef = useRef<HTMLDivElement | null>(null);

  const handleGenerate = useCallback(async () => {
    setStep('loading');
    setError(null);
    
    try {
      // Check if user is logged in
      if (!currentUser) {
        setStep('input');
        setError('Please log in to generate worksheets.');
        return;
      }

      // Check daily quota from Firestore
      const quota = await checkDailyQuota(currentUser.uid);
      
      if (!quota.canUse) {
        setStep('input');
        
        // Get user plan
        const userData = await getUserData(currentUser.uid);
        const isPro = userData?.plan === 'Pro';
        
        if (isPro) {
          setQuotaTitle('Daily Limit Reached');
          setQuotaMessage(`You have used all ${quota.limit} generations today. Please try again tomorrow.`);
          setQuotaActionText(undefined);
        } else {
          setQuotaTitle('Free Limit Reached');
          setQuotaMessage(`You have used your ${quota.limit} free worksheet today. Upgrade to Pro for unlimited generations!`);
          setQuotaActionText('Upgrade to Pro');
        }
        setQuotaOpen(true);
        return;
      }

      // Generate worksheet
      const generatedPages = await generateWorksheetContent(config);
      setPages(generatedPages);
      
      // Record usage in Firestore
      await recordUsage(currentUser.uid, config.type);
      
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep('input');
    }
  }, [config, currentUser]);

  const handleDownloadPdf = useCallback(async () => {
    if (!pagesRef.current) return;
    setExporting(true);
    try {
      // 获取用户打印设置
      const { getPrintSettings, getDefaultPrintSettings } = await import('../services/firestoreService');
      let printSettings = getDefaultPrintSettings();
      if (currentUser) {
        try {
          const userSettings = await getPrintSettings(currentUser.uid);
          if (userSettings) printSettings = userSettings;
        } catch (e) {
          console.log('使用默认打印设置');
        }
      }

      const isA4 = printSettings.paperSize === 'a4';
      const pageWidth = isA4 ? 210 : 215.9;
      const pageHeight = isA4 ? 297 : 279.4;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: isA4 ? 'a4' : 'letter' });
      const pageElements = pagesRef.current.querySelectorAll<HTMLElement>('[data-pdf-page]');

      for (let i = 0; i < pageElements.length; i++) {
        const el = pageElements[i];
        const rect = el.getBoundingClientRect();
        const canvas = await html2canvas(el, {
          scale: 2,
          width: Math.ceil(rect.width),
          height: Math.ceil(rect.height),
          windowWidth: Math.max(Math.ceil(rect.width), 1200),
          windowHeight: Math.max(Math.ceil(rect.height), 1400),
          scrollX: -window.scrollX,
          scrollY: -window.scrollY,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        
        // Letter 图片适配不同纸张：
        // - Letter 纸：以宽度为准，完美适配
        // - A4 纸：以高度为准，左右均匀裁剪
        const imgRatio = imgProps.width / imgProps.height;
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

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      }

      pdf.save('ai-kid-print.pdf');
      
      // 记录下载
      if (currentUser) {
        try {
          await recordDownload(currentUser.uid, 'worksheet', config.theme || 'default', pageElements.length);
          window.dispatchEvent(new Event('downloadComplete'));
        } catch (e) {
          console.error('Failed to record download:', e);
        }
      }
    } catch (e) {
      console.error('PDF export failed', e);
      setError('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  }, [currentUser, config.theme]);

  // Input Form Component
  const InputForm = () => (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12 animate-pop-in">
        <h2 className="text-5xl font-display font-black text-black mb-2 uppercase tracking-tight">Builder</h2>
        <p className="text-slate-600 font-mono bg-white inline-block px-3 py-1 rounded-lg border border-black shadow-sm">Let's create something fun!</p>
      </div>

      <div className="bg-white border-2 border-black shadow-brutal-lg rounded-3xl p-6 md:p-12 space-y-10 relative animate-pop-in" style={{animationDelay: '0.1s'}}>
        {/* Decor dots */}
        <div className="absolute top-4 right-4 w-3 h-3 bg-duck-orange rounded-full border border-black"></div>
        <div className="absolute top-4 right-8 w-3 h-3 bg-duck-blue rounded-full border border-black"></div>

        {/* Age Selection */}
        <div>
          <label className="block text-black font-bold font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-duck-yellow rounded-full flex items-center justify-center border border-black text-xs">1</div>
            Child's Age
          </label>
          <div className="flex flex-wrap gap-3">
            {AGES.map((age) => (
              <button
                key={age}
                onClick={() => setConfig({ ...config, age })}
                className={`w-14 h-14 rounded-xl border-2 border-black flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                  config.age === age 
                    ? 'bg-duck-yellow shadow-brutal -translate-y-1 scale-110' 
                    : 'bg-white hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Selection */}
        <div>
           <label className="block text-black font-bold font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-duck-blue rounded-full flex items-center justify-center border border-black text-xs">2</div>
            Subject
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TOPICS.map((topic) => (
              <button
                key={topic.value}
                onClick={() => setConfig({ ...config, type: topic.value })}
                className={`p-4 border-2 border-black rounded-xl text-left transition-all duration-200 group ${
                  config.type === topic.value
                    ? 'bg-duck-blue shadow-brutal -translate-y-1 ring-2 ring-black ring-offset-2'
                    : 'bg-white hover:bg-slate-50 hover:shadow-brutal-sm hover:-translate-y-0.5'
                }`}
              >
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform origin-left">{topic.icon}</span>
                <span className="font-bold block font-display uppercase tracking-wide">{topic.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme & Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-black font-bold font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-duck-green rounded-full flex items-center justify-center border border-black text-xs">3</div>
                Theme
            </label>
            <div className="relative group">
                <select
                value={config.theme}
                onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                className="w-full p-4 border-2 border-black bg-white rounded-xl focus:outline-none focus:ring-0 focus:shadow-brutal transition-all font-medium appearance-none cursor-pointer hover:bg-slate-50"
                >
                {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none border-2 border-black rounded-full p-1 bg-white group-hover:bg-duck-yellow transition-colors">
                    <ArrowLeft size={12} className="-rotate-90 text-black"/>
                </div>
            </div>
          </div>
          <div>
             <label className="block text-black font-bold font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-duck-pink rounded-full flex items-center justify-center border border-black text-xs">4</div>
                Difficulty
            </label>
            <div className="relative group">
                <select
                value={config.difficulty}
                onChange={(e) => setConfig({ ...config, difficulty: e.target.value as DifficultyLevel })}
                className="w-full p-4 border-2 border-black bg-white rounded-xl focus:outline-none focus:ring-0 focus:shadow-brutal transition-all font-medium appearance-none cursor-pointer hover:bg-slate-50"
                >
                {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none border-2 border-black rounded-full p-1 bg-white group-hover:bg-duck-pink transition-colors">
                     <ArrowLeft size={12} className="-rotate-90 text-black"/>
                </div>
            </div>
          </div>
        </div>
        
        {/* Page Count */}
        <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl">
             <label className="block text-black font-bold font-mono uppercase tracking-wider mb-3 flex justify-between">
                 <span>Page Count</span>
                 <span className="text-xs bg-duck-yellow border border-black rounded-md px-2 py-1 font-bold flex items-center gap-1"><Lock size={10}/> PRO UNLOCKED</span>
             </label>
             <div className="flex items-center gap-4">
                 <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={config.pageCount} 
                    onChange={(e) => setConfig({...config, pageCount: parseInt(e.target.value)})}
                    className="w-full h-4 bg-slate-200 rounded-full appearance-none cursor-pointer accent-black hover:accent-duck-blue transition-colors"
                 />
                 <span className="font-bold font-display text-2xl text-black w-12 h-12 flex items-center justify-center border-2 border-black rounded-lg bg-white shadow-sm">{config.pageCount}</span>
             </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-duck-green text-black border-2 border-black text-xl font-bold py-4 rounded-xl shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-3 uppercase group"
        >
          <Sparkles className="stroke-2 group-hover:rotate-12 transition-transform" /> Generate Worksheet
        </button>
        
        {error && (
            <div className="p-4 bg-red-100 border-2 border-red-500 rounded-xl text-red-600 font-bold text-center font-mono animate-bounce">
                ERROR: {error}
            </div>
        )}
      </div>
    </div>
  );

  // Loading State
  const LoadingView = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative w-32 h-32 mb-8">
         {/* Bouncing elements */}
         <div className="absolute inset-0 bg-duck-yellow border-2 border-black rounded-3xl rotate-12 animate-pulse"></div>
         <div className="absolute inset-0 bg-white border-2 border-black rounded-3xl -rotate-6 flex items-center justify-center z-10 animate-float">
            <span className="text-6xl animate-spin-slow">✏️</span>
         </div>
      </div>
      <h3 className="text-4xl font-display font-black text-black mb-2 tracking-tight">GENERATING...</h3>
      <p className="text-slate-600 font-mono bg-white px-4 py-2 rounded-full border-2 border-black shadow-brutal-sm animate-pulse">
        Creating a unique {config.theme} {config.type} worksheet!
      </p>
    </div>
  );

  // Preview State
  const PreviewView = () => (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 no-print gap-4 bg-white p-4 rounded-2xl border-2 border-black shadow-brutal-sm">
        <button 
            onClick={() => setStep('input')}
            className="flex items-center gap-2 text-slate-600 hover:text-black font-bold uppercase text-sm transition-colors"
        >
            <div className="bg-slate-100 p-2 rounded-lg border border-black hover:bg-duck-yellow transition-colors"><ArrowLeft size={16} /></div>
            Edit Settings
        </button>
        <div className="flex gap-4">
            <button 
                onClick={handleGenerate}
                className="flex items-center gap-2 bg-white border-2 border-black rounded-lg text-black px-4 py-2 font-bold shadow-brutal hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all uppercase text-sm"
            >
                <RefreshCw size={18} /> Regenerate
            </button>
            <button 
                onClick={handleDownloadPdf}
                disabled={exporting}
                className="flex items-center gap-2 bg-duck-blue border-2 border-black rounded-lg text-black px-6 py-2 font-bold shadow-brutal hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all uppercase text-sm group disabled:opacity-60 disabled:cursor-not-allowed"
            >
                <Download size={18} className="group-hover:animate-bounce"/> {exporting ? 'Preparing PDF...' : 'Download / Print'}
            </button>
        </div>
      </div>

      {/* Render all pages */}
      <div ref={pagesRef} className="space-y-12 print:space-y-0 print:block p-8 bg-slate-200/50 rounded-3xl border-2 border-black/10 print:bg-white print:p-0 print:border-none print:rounded-none">
        {pages.map((page, idx) => (
            <div 
              key={idx} 
              data-pdf-page
              className="shadow-2xl print:shadow-none mb-10 print:mb-0 print:break-after-page aspect-[1/1.414] mx-auto w-full max-w-[210mm] bg-white animate-fade-scale rounded-sm overflow-hidden print:w-[190mm] print:h-[270mm] print:max-w-none print:aspect-auto print:scale-[0.96] print:origin-top"
              style={{ animationDelay: `${idx * 150}ms`, transformOrigin: 'top' }}
            >
                <WorksheetRenderer page={page} showWatermark={true} />
            </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 bg-paper">
      {step === 'input' && <InputForm />}
      {step === 'loading' && <LoadingView />}
      {step === 'preview' && <PreviewView />}
      <QuotaModal
        open={quotaOpen}
        title={quotaTitle}
        message={quotaMessage}
        actionText={quotaActionText}
        onClose={() => setQuotaOpen(false)}
      />
    </div>
  );
};

export default Generator;