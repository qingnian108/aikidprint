import React, { useState, useEffect } from 'react';
import { Printer, Droplet, FileText, Check, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  savePrintSettings, 
  getPrintSettings, 
  getDefaultPrintSettings 
} from '../services/firestoreService';

const PrintSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [printMode, setPrintMode] = useState<'color' | 'eco'>('color');
  const [paperSize, setPaperSize] = useState<'letter' | 'a4'>('letter');
  const [binderReady, setBinderReady] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 加载用户设置
  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser) {
        // 未登录时使用默认设置
        const defaults = getDefaultPrintSettings();
        setPrintMode(defaults.printMode);
        setPaperSize(defaults.paperSize);
        setBinderReady(defaults.binderReady);
        setLoading(false);
        return;
      }

      try {
        const settings = await getPrintSettings(currentUser.uid);
        if (settings) {
          setPrintMode(settings.printMode);
          setPaperSize(settings.paperSize);
          setBinderReady(settings.binderReady);
        }
      } catch (error) {
        console.error('加载设置失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) {
      alert('Please login to save settings');
      return;
    }

    setSaving(true);
    try {
      await savePrintSettings(currentUser.uid, {
        printMode,
        paperSize,
        binderReady
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('保存失败:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border-4 border-black rounded-2xl shadow-brutal p-8">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-duck-blue" />
          <span className="ml-3 font-mono text-slate-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black rounded-2xl shadow-brutal p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-duck-blue border-2 border-black p-3 rounded-xl">
          <Printer size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-display font-bold">Print Settings</h2>
          <p className="text-slate-600 font-mono text-sm">
            Customize your printing preferences
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Print Mode */}
        <div>
          <label className="block text-lg font-bold mb-3">Print Mode</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPrintMode('color')}
              className={`p-6 border-3 border-black rounded-xl transition-all ${
                printMode === 'color'
                  ? 'bg-duck-yellow shadow-brutal scale-105'
                  : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="text-4xl mb-3">🎨</div>
              <div className="font-bold text-lg mb-1">Color Mode</div>
              <div className="text-sm text-slate-600 font-mono">
                Full color printing
              </div>
              <div className="mt-3 text-xs font-mono text-slate-500">
                Best for: Coloring pages, visual learning
              </div>
            </button>

            <button
              onClick={() => setPrintMode('eco')}
              className={`p-6 border-3 border-black rounded-xl transition-all ${
                printMode === 'eco'
                  ? 'bg-duck-green shadow-brutal scale-105'
                  : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-4xl mb-3">
                ♻️
                <Droplet size={32} />
              </div>
              <div className="font-bold text-lg mb-1">Eco Mode</div>
              <div className="text-sm text-slate-600 font-mono">
                Black & white, save ink
              </div>
              <div className="mt-3 text-xs font-mono text-slate-500">
                Best for: Practice sheets, daily use
              </div>
            </button>
          </div>

          {printMode === 'eco' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-duck-green/20 border-2 border-duck-green rounded-xl p-4 flex items-start gap-3"
            >
              <Check className="flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm font-mono">
                <strong>Eco Mode saves up to 60% ink!</strong> Perfect for daily worksheets and practice pages.
              </div>
            </motion.div>
          )}
        </div>

        {/* Paper Size */}
        <div>
          <label className="block text-lg font-bold mb-3 flex items-center gap-2">
            <FileText size={20} />
            Paper Size
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaperSize('letter')}
              className={`p-4 border-3 border-black rounded-xl transition-all ${
                paperSize === 'letter'
                  ? 'bg-duck-blue shadow-brutal'
                  : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-lg mb-1">Letter</div>
              <div className="text-sm text-slate-600 font-mono">8.5" × 11"</div>
              <div className="text-xs text-slate-500 font-mono mt-1">US Standard</div>
            </button>

            <button
              onClick={() => setPaperSize('a4')}
              className={`p-4 border-3 border-black rounded-xl transition-all ${
                paperSize === 'a4'
                  ? 'bg-duck-blue shadow-brutal'
                  : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-lg mb-1">A4</div>
              <div className="text-sm text-slate-600 font-mono">210 × 297 mm</div>
              <div className="text-xs text-slate-500 font-mono mt-1">International</div>
            </button>
          </div>
        </div>

        {/* Binder Ready */}
        <div>
          <label className="block text-lg font-bold mb-3">Additional Options</label>
          <button
            onClick={() => setBinderReady(!binderReady)}
            className={`w-full p-4 border-3 border-black rounded-xl transition-all flex items-center justify-between ${
              binderReady
                ? 'bg-duck-pink shadow-brutal'
                : 'bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">📎</div>
              <div className="text-left">
                <div className="font-bold">Binder Ready (3-Hole Punch)</div>
                <div className="text-sm text-slate-600 font-mono">
                  Add margins for hole punching
                </div>
              </div>
            </div>
            <div className={`w-6 h-6 border-2 border-black rounded flex items-center justify-center ${
              binderReady ? 'bg-black' : 'bg-white'
            }`}>
              {binderReady && <Check size={16} className="text-white" strokeWidth={3} />}
            </div>
          </button>
        </div>

        {/* Preview Info */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>📋</span>
            Current Settings Summary
          </h3>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-slate-600">Print Mode:</span>
              <span className="font-bold">
                {printMode === 'color' ? '🎨 Color' : '♻️ Eco (B&W)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Paper Size:</span>
              <span className="font-bold">
                {paperSize === 'letter' ? 'Letter (8.5" × 11")' : 'A4 (210 × 297 mm)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Binder Ready:</span>
              <span className="font-bold">
                {binderReady ? '✓ Yes' : '✗ No'}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !currentUser}
          className="w-full brutal-btn bg-duck-green text-black border-3 border-black px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader size={24} className="animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check size={24} />
              Saved!
            </>
          ) : (
            <>
              <Check size={24} />
              Save Print Settings
            </>
          )}
        </button>

        {!currentUser && (
          <p className="text-center text-sm text-slate-500 font-mono">
            Please login to save your settings
          </p>
        )}
      </div>
    </div>
  );
};

export default PrintSettings;
