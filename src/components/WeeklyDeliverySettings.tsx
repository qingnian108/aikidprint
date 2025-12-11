import React, { useState } from 'react';
import { Calendar, Mail, Download, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const WeeklyDeliverySettings: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'manual'>('email');
  const [deliveryTime, setDeliveryTime] = useState('08:00');
  const [timezone, setTimezone] = useState('America/New_York');

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
  };

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

          {/* Delivery Time */}
          {deliveryMethod === 'email' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="block text-lg font-bold mb-3 flex items-center gap-2">
                <Clock size={20} />
                Delivery Time
              </label>
              <input
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold text-lg"
              />
            </motion.div>
          )}

          {/* Timezone */}
          {deliveryMethod === 'email' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-lg font-bold mb-3">Timezone</label>
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
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Australia/Sydney">Sydney (AEDT)</option>
              </select>
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
                      Sunday, {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
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
          <button className="w-full brutal-btn bg-duck-green text-black border-3 border-black px-6 py-4 rounded-xl font-bold text-lg">
            Save Settings
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
