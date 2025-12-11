import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const NameInputHero: React.FC = () => {
  const [name, setName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      navigate(`/preview/${encodeURIComponent(name.trim())}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  return (
    <section className="relative pt-10 pb-28 md:pt-20 md:pb-32 overflow-visible">
      {/* Floating Decorations */}
      <motion.div 
        className="absolute top-20 left-10 hidden md:block"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg className="w-32 h-20 text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" viewBox="0 0 100 60" fill="currentColor">
          <path d="M10 45H83C91.28 45 98 38.28 98 30C98 21.72 91.28 15 83 15C79.68 15 76.28 16.44 73.77 18.79C73.92 17.88 74 16.95 74 16C74 4.95 65.05 -4 54 -4C46.12 -4 39.26 0.36 36.14 7.12C34.24 6.4 32.18 6 30 6C20.88 6 13.64 12.88 12.58 21.42C11.76 21.15 10.9 21 10 21C4.477 21 0 25.477 0 31C0 36.523 4.477 41 10 41Z" stroke="black" strokeWidth="2.5" fill="white"/>
        </svg>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-40 right-20 hidden md:block"
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        <svg className="w-24 h-16 text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" viewBox="0 0 100 60" fill="currentColor">
          <path d="M10 45H83C91.28 45 98 38.28 98 30C98 21.72 91.28 15 83 15C79.68 15 76.28 16.44 73.77 18.79C73.92 17.88 74 16.95 74 16C74 4.95 65.05 -4 54 -4C46.12 -4 39.26 0.36 36.14 7.12C34.24 6.4 32.18 6 30 6C20.88 6 13.64 12.88 12.58 21.42C11.76 21.15 10.9 21 10 21C4.477 21 0 25.477 0 31C0 36.523 4.477 41 10 41Z" stroke="black" strokeWidth="2.5" fill="white"/>
        </svg>
      </motion.div>

      {/* Floating Emojis */}
      <motion.div
        className="absolute top-32 right-32 text-5xl hidden lg:block"
        animate={{ 
          y: [0, -25, 0],
          rotate: [0, 15, -15, 0]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        ✏️
      </motion.div>
      
      <motion.div
        className="absolute bottom-32 left-32 text-5xl hidden lg:block"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, -10, 10, 0]
        }}
        transition={{ 
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        🎨
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-10 text-4xl hidden lg:block"
        animate={{ 
          y: [0, -15, 0],
          x: [0, 10, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        ⭐
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-16 text-4xl hidden lg:block"
        animate={{ 
          y: [0, -18, 0],
          rotate: [0, 20, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      >
        🌟
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title with Bouncing Letters */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black leading-[0.95] mb-6 tracking-tight flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="whitespace-nowrap text-black"
            >
              {"Turn Your Child's Name".split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 0 }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                    delay: i * 0.05
                  }}
                  className="inline-block"
                  style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.div>
            <div className="text-duck-orange whitespace-nowrap mt-2">
              {"Into Learning Magic".split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 0 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 3,
                    delay: 0.3 + i * 0.05
                  }}
                  className="inline-block"
                  style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>
          </h1>

          {/* Subtitle with Wave Effect */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl font-mono text-slate-700 mb-12 max-w-4xl mx-auto leading-relaxed whitespace-nowrap px-4"
          >
            {"One click → Personalized worksheets → Delivered every Sunday.".split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.05,
                  delay: 0.2 + i * 0.02
                }}
                className="inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.p>

          {/* Name Input Form */}
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <div className="relative">
                <motion.div
                  animate={!name ? {
                    boxShadow: [
                      '8px 8px 0px 0px rgba(0,0,0,1)',
                      '12px 12px 0px 0px rgba(255,214,10,1)',
                      '8px 8px 0px 0px rgba(0,0,0,1)'
                    ]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="rounded-2xl"
                >
                  <input
                    type="text"
                    value={name}
                    onChange={handleInputChange}
                    placeholder="Enter your child's name..."
                    className="w-full px-8 py-6 text-2xl md:text-3xl font-display font-bold text-center border-4 border-black rounded-2xl shadow-brutal-lg focus:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-duck-yellow transition-all duration-300 bg-white"
                    maxLength={20}
                  />
                </motion.div>
                {isTyping && name && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg text-sm font-mono whitespace-nowrap"
                  >
                    ✨ Designing for {name}...
                  </motion.div>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={!name.trim()}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)'
                }}
                whileTap={{ scale: 0.95 }}
                animate={name.trim() ? {
                  y: [0, -5, 0]
                } : {}}
                transition={{
                  y: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="mt-6 w-full md:w-auto brutal-btn bg-duck-blue text-black border-4 border-black text-xl md:text-2xl px-12 py-5 font-bold shadow-brutal-lg rounded-2xl flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {"Generate My Free Page".split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    animate={name.trim() ? {
                      y: [0, -3, 0]
                    } : {}}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatDelay: 1,
                      delay: i * 0.1
                    }}
                    className="inline-block"
                  >
                    {word}{i < 3 ? '\u00A0' : ''}
                  </motion.span>
                ))}
                <motion.span
                  animate={{
                    x: [0, 5, 0]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="border-2 border-black rounded-full p-1 bg-white" size={28} />
                </motion.span>
              </motion.button>
            </div>
          </motion.form>

          {/* Trust Badge with Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex items-center justify-center gap-2 text-slate-600 font-mono text-sm"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <motion.div 
                  key={i} 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.8 + i * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 10,
                    zIndex: 10
                  }}
                  className="w-8 h-8 rounded-full border-2 border-black bg-duck-yellow flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  👤
                </motion.div>
              ))}
            </div>
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="font-bold"
            >
              10,000+ families
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 }}
            >
              trust AI Kid Print
            </motion.span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NameInputHero;
