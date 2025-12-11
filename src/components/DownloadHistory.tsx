import React from 'react';
import { Download, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subWeeks } from 'date-fns';

interface WeeklyPack {
  id: string;
  weekNumber: number;
  date: Date;
  theme: string;
  emoji: string;
  pages: number;
  downloaded: boolean;
}

const DownloadHistory: React.FC = () => {
  // Generate mock history data
  const history: WeeklyPack[] = Array.from({ length: 8 }, (_, i) => {
    const date = subWeeks(new Date(), i);
    const themes = [
      { name: 'Dinosaurs', emoji: '🦕' },
      { name: 'Space', emoji: '🚀' },
      { name: 'Ocean', emoji: '🐠' },
      { name: 'Safari', emoji: '🦁' },
      { name: 'Unicorn', emoji: '🦄' },
      { name: 'Cars', emoji: '🚗' }
    ];
    const theme = themes[i % themes.length];
    
    return {
      id: `week-${i}`,
      weekNumber: 48 - i,
      date,
      theme: theme.name,
      emoji: theme.emoji,
      pages: 15 + Math.floor(Math.random() * 6),
      downloaded: i < 3
    };
  });

  const handleDownload = (pack: WeeklyPack) => {
    console.log('Downloading pack:', pack.id);
    // Implement actual download logic
  };

  return (
    <div className="bg-white border-4 border-black rounded-2xl shadow-brutal p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-display font-bold mb-2">Download History</h2>
          <p className="text-slate-600 font-mono text-sm">
            Access your past weekly packs anytime
          </p>
        </div>
        <div className="bg-duck-yellow border-2 border-black px-4 py-2 rounded-full font-bold text-sm">
          {history.length} Weeks
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-slate-200"></div>

        {/* Timeline Items */}
        <div className="space-y-6">
          {history.map((pack, index) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-20"
            >
              {/* Timeline Dot */}
              <div className="absolute left-5 top-6 w-7 h-7 bg-white border-3 border-black rounded-full flex items-center justify-center z-10">
                <div className={`w-3 h-3 rounded-full ${pack.downloaded ? 'bg-duck-green' : 'bg-slate-300'}`}></div>
              </div>

              {/* Card */}
              <div className={`bg-white border-3 border-black rounded-xl shadow-brutal-sm p-6 hover:shadow-brutal hover:-translate-y-1 transition-all ${
                index === 0 ? 'ring-2 ring-duck-yellow' : ''
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{pack.emoji}</span>
                      <div>
                        <h3 className="text-xl font-display font-bold">
                          Week {pack.weekNumber} - {pack.theme}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {format(pack.date, 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={14} />
                            {pack.pages} pages
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {index === 0 && (
                      <div className="inline-block bg-duck-yellow border-2 border-black px-3 py-1 rounded-full text-xs font-bold mt-2">
                        ⭐ Latest
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDownload(pack)}
                    className={`brutal-btn border-2 border-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${
                      pack.downloaded
                        ? 'bg-duck-green hover:bg-duck-blue'
                        : 'bg-white hover:bg-duck-yellow'
                    }`}
                  >
                    <Download size={18} />
                    {pack.downloaded ? 'Re-download' : 'Download'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <button className="px-8 py-3 border-2 border-black rounded-xl font-bold hover:bg-slate-50 transition-colors">
          Load More Weeks
        </button>
      </div>
    </div>
  );
};

export default DownloadHistory;
