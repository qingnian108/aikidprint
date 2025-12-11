import React, { useState } from 'react';
import { Search, Calendar, Package, Download, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Themed Packs', 'Holiday Packs', 'Weekly Archive'];

const LIBRARY_ITEMS = [
  {
    id: 1,
    title: 'Dinosaur Adventure Pack',
    category: 'Themed Packs',
    emoji: '🦕',
    pages: 15,
    description: 'Roar into learning with prehistoric fun',
    isPro: false,
    color: 'bg-duck-green'
  },
  {
    id: 2,
    title: 'Space Explorer Pack',
    category: 'Themed Packs',
    emoji: '🚀',
    pages: 18,
    description: 'Blast off to the stars with math and letters',
    isPro: false,
    color: 'bg-duck-blue'
  },
  {
    id: 3,
    title: 'Ocean Discovery Pack',
    category: 'Themed Packs',
    emoji: '🐠',
    pages: 16,
    description: 'Dive deep into underwater adventures',
    isPro: true,
    color: 'bg-duck-blue'
  },
  {
    id: 4,
    title: 'Halloween Fun Pack',
    category: 'Holiday Packs',
    emoji: '🎃',
    pages: 12,
    description: 'Spooky learning activities for October',
    isPro: false,
    color: 'bg-duck-orange'
  },
  {
    id: 5,
    title: 'Christmas Magic Pack',
    category: 'Holiday Packs',
    emoji: '🎄',
    pages: 20,
    description: 'Festive worksheets for December joy',
    isPro: true,
    color: 'bg-duck-green'
  },
  {
    id: 6,
    title: 'Safari Adventure Pack',
    category: 'Themed Packs',
    emoji: '🦁',
    pages: 14,
    description: 'Wild animals and jungle exploration',
    isPro: true,
    color: 'bg-duck-yellow'
  },
  {
    id: 7,
    title: 'Week 45 Archive',
    category: 'Weekly Archive',
    emoji: '📅',
    pages: 18,
    description: 'November learning pack',
    isPro: true,
    color: 'bg-slate-200'
  },
  {
    id: 8,
    title: 'Week 46 Archive',
    category: 'Weekly Archive',
    emoji: '📅',
    pages: 17,
    description: 'November learning pack',
    isPro: true,
    color: 'bg-slate-200'
  },
  {
    id: 9,
    title: 'Unicorn Dreams Pack',
    category: 'Themed Packs',
    emoji: '🦄',
    pages: 16,
    description: 'Magical learning with rainbows and sparkles',
    isPro: true,
    color: 'bg-duck-pink'
  }
];

const Library: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = LIBRARY_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-paper py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-duck-yellow border-2 border-black px-4 py-2 rounded-full font-bold mb-4">
            <Package size={20} />
            Resource Library
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-black mb-4">
            Explore Our
            <br />
            <span className="text-duck-orange">Learning Packs</span>
          </h1>
          <p className="text-xl text-slate-600 font-mono max-w-2xl mx-auto">
            Themed collections, holiday specials, and archived weekly packs
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={24} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search packs..."
              className="w-full pl-14 pr-6 py-4 text-lg border-3 border-black rounded-xl focus:ring-4 focus:ring-duck-yellow focus:outline-none shadow-brutal"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 border-2 border-black rounded-xl font-bold transition-all ${
                  selectedCategory === category
                    ? 'bg-duck-blue shadow-brutal scale-105'
                    : 'bg-white hover:bg-slate-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="text-center mb-8">
          <p className="text-slate-600 font-mono">
            Showing <strong>{filteredItems.length}</strong> pack{filteredItems.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Library Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border-4 border-black rounded-2xl shadow-brutal hover:shadow-brutal-lg hover:-translate-y-2 transition-all overflow-hidden group"
            >
              {/* Card Header */}
              <div className={`${item.color} p-8 border-b-4 border-black relative`}>
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {item.emoji}
                </div>
                {item.isPro && (
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Lock size={12} />
                    PRO
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-2xl font-display font-bold mb-2">{item.title}</h3>
                <p className="text-slate-600 font-mono text-sm mb-4">{item.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-mono text-slate-500">
                    <Calendar size={16} />
                    <span>{item.pages} pages</span>
                  </div>
                  <div className="bg-slate-100 border-2 border-black px-3 py-1 rounded-lg text-xs font-bold">
                    {item.category}
                  </div>
                </div>

                {/* Download Button */}
                {item.isPro ? (
                  <button className="w-full px-6 py-3 bg-slate-100 border-2 border-black rounded-xl font-bold text-slate-500 cursor-not-allowed flex items-center justify-center gap-2">
                    <Lock size={18} />
                    Upgrade to Download
                  </button>
                ) : (
                  <button className="w-full brutal-btn bg-duck-green text-black border-2 border-black px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Download size={18} />
                    Download Free
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-display font-bold mb-2">No packs found</h3>
            <p className="text-slate-600 font-mono">Try adjusting your search or filters</p>
          </motion.div>
        )}

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 bg-gradient-to-r from-duck-yellow via-duck-blue to-duck-pink border-4 border-black rounded-2xl shadow-brutal-lg p-12 text-center"
        >
          <h2 className="text-4xl font-display font-black mb-4">
            Want Access to Everything?
          </h2>
          <p className="text-xl font-mono mb-8 max-w-2xl mx-auto">
            Upgrade to Pro and unlock all themed packs, holiday specials, and weekly archives
          </p>
          <button className="brutal-btn bg-black text-white border-3 border-white px-12 py-5 rounded-2xl font-bold text-xl shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
            Upgrade to Pro →
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Library;
