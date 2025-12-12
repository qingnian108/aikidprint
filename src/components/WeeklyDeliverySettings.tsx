import React, { useState, useEffect } from 'react';
import { Calendar, Mail, Download, Clock, Loader, Check, User, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  saveWeeklyDeliverySettings, 
  getWeeklyDeliverySettings,
  getUserChildren 
} from '../services/firestoreService';

const THEMES = [
  { id: 'dinosaur', name: 'Dinosaur', emoji: '🦕' },
  { id: 'space', name: 'Space', emoji: '🚀' },
  { id: 'ocean', name: 'Ocean', emoji: '🐠' },
  { id: 'safari', name: 'Safari', emoji: '🦁' },
  { id: 'unicorn', name: 'Unicorn', emoji: '🦄' },
  { id: 'vehicles', name: 'Vehicles', emoji: '🚗' },
];

const AGES = ['3', '4', '5', '6'];

const WeeklyDeliverySettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'manual'>('email');
  const [deliveryTime, setDeliveryTime] = useState('08:00');
  const [timezone, setTimezone] = useState('America/New_York');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('4');
  const [theme, setTheme] = useState('dinosaur');
  const [email, setEmail] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 加载用户设置
  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const settings = await getWeeklyDeliverySettings(currentUser.uid);
        if (settings) {
          setIsEnabled(settings.enabled);
          setDeliveryMethod(settings.deliveryMethod);
          setDeliveryTime(settings.deliveryTime);
          setTimezone(settings.timezone);
          setChildName(settings.childName);
          setChildAge(settings.childAge);
          setTheme(settings.theme);
          setEmail(settings.email);
        } else {
          // 默认使用用户邮箱
          setEmail(currentUser.email || '');
        }
      } catch (error) {
        console.error('加载设置失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentUser]);


  // 保存设置
  const handleSave = async () => {
    if (!currentUser) return;
    
    // 验证
    if (isEnabled && deliveryMethod === 'email' && !email) {
      alert('Please enter your email address');
      return;
    }
    if (isEnabled && !childName.trim()) {
      alert('Please enter child name');
      return;
    }

    setSaving(true);
    try {
      await saveWeeklyDeliverySettings(currentUser.uid, {
        enabled: isEnabled,
        deliveryMethod,
        deliveryTime,
        timezone,
        childName: childName.trim(),
        childAge,
        theme,
        email
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

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
  };

  // 计算下一个周日
  const getNextSunday = () => {
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    return nextSunday;
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

  if (!currentUser) {
    return (
      <div className="bg-white border-4 border-black rounded-2xl shadow-brutal p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-2xl font-display font-bold mb-2">Login Required</h3>
          <p className="text-slate-600 font-mono">Please login to configure weekly delivery</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black rounded-2xl shadow-brutal p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-display font-bold mb-2">Weekly Delivery</h2>
          <p className="text-slate-600 font-mono text-sm">
            Automatic learning packs every Sunday
          </p>
        </div>
        
        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          className={`relative w-20 h-10 rounded-full border-3 border-black transition-all ${
            isEnabled ? 'bg-duck-green' : 'bg-slate-200'
          }`}
        >
          <motion.div
            animate={{ x: isEnabled ? 36 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-7 h-7 bg-white border-2 border-black rounded-full shadow-sm"
          />
        </button>
      </div>

      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6"
        >
          {/* Child Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-bold mb-2 flex items-center gap-2">
                <User size={20} />
                Child Name
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Enter child's name"
                className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold text-lg"
              />
            </div>
            <div>
              <label className="block text-lg font-bold mb-2">Age</label>
              <select
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold text-lg"
              >
                {AGES.map(age => (
                  <option key={age} value={age}>{age} years old</option>
                ))}
              </select>
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-lg font-bold mb-3 flex items-center gap-2">
              <Palette size={20} />
              Theme
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 border-2 border-black rounded-xl transition-all text-center ${
                    theme === t.id
                      ? 'bg-duck-yellow shadow-brutal-sm'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{t.emoji}</div>
                  <div className="text-xs font-bold">{t.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Method */}
          <div>
            <label className="block text-lg font-bold mb-3">Delivery Method</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDeliveryMethod('email')}
                className={`p-4 border-3 border-black rounded-xl transition-all ${
                  deliveryMethod === 'email'
                    ? 'bg-duck-blue shadow-brutal'
                    : 'bg-white hover:bg-slate-50'
                }`}
              >
                <Mail className="mx-auto mb-2" size={32} />
                <div className="font-bold">Email</div>
                <div className="text-xs text-slate-600 font-mono">Send to inbox</div>
              </button>
              <button
                onClick={() => setDeliveryMethod('manual')}
                className={`p-4 border-3 border-black rounded-xl transition-all ${
                  deliveryMethod === 'manual'
                    ? 'bg-duck-blue shadow-brutal'
                    : 'bg-white hover:bg-slate-50'
                }`}
              >
                <Download className="mx-auto mb-2" size={32} />
                <div className="font-bold">Manual</div>
                <div className="text-xs text-slate-600 font-mono">Download from dashboard</div>
              </button>
            </div>
          </div>

          {/* Email & Time Settings */}
          {deliveryMethod === 'email' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-lg font-bold mb-2 flex items-center gap-2">
                  <Mail size={20} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold text-lg"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-bold mb-2 flex items-center gap-2">
                    <Clock size={20} />
                    Delivery Time
                  </label>
                  <input
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold text-lg"
                  />
                </div>
                <div>
                  <label className="block text-lg font-bold mb-2">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold text-lg"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Australia/Sydney">Sydney (AEDT)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Schedule Preview */}
          <div className="bg-duck-yellow/20 border-2 border-duck-yellow rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Calendar className="flex-shrink-0 mt-1" size={24} />
              <div>
                <div className="font-bold mb-1">Next Delivery</div>
                <div className="text-sm font-mono text-slate-700">
                  {deliveryMethod === 'email' ? (
                    <>
                      Sunday, {getNextSunday().toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric' 
                      })} at {deliveryTime}
                      <br />
                      <span className="text-xs text-slate-500">({timezone})</span>
                    </>
                  ) : (
                    <>
                      Available for download every Sunday
                      <br />
                      <span className="text-xs text-slate-500">Check your dashboard</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full brutal-btn bg-duck-green text-black border-3 border-black px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader size={20} className="animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check size={20} />
                Saved!
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </motion.div>
      )}

      {!isEnabled && (
        <div className="text-center py-8 text-slate-500 font-mono">
          Weekly delivery is currently disabled
        </div>
      )}
    </div>
  );
};

export default WeeklyDeliverySettings;
