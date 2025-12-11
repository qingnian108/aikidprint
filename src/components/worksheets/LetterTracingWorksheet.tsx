import React from 'react';

interface LetterTracingData {
  letter: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rows: number;
  instructions: string;
}

interface Props {
  data: LetterTracingData;
}

// 字母对应的 emoji 图案
const LETTER_IMAGES: Record<string, string[]> = {
  'A': ['🍎', '🐊', '✈️'],
  'B': ['🎈', '🐻', '🚌', '⚾'],
  'C': ['🐱', '🚗', '🎂', '☕'],
  'D': ['🐕', '🦕', '🥁', '🚪'],
  'E': ['🐘', '🥚', '👁️', '🌍'],
  'F': ['🐸', '🍟', '🔥', '🌸'],
  'G': ['🦒', '🍇', '🎸', '👻'],
  'H': ['🐴', '🏠', '❤️', '🎩'],
  'I': ['🍦', '🏝️', '💡', '🧊'],
  'J': ['🤹', '🧃', '🕹️', '👖'],
  'K': ['🔑', '🦘', '🥋', '🪁'],
  'L': ['🦁', '🍋', '🦎', '💡'],
  'M': ['🐵', '🌙', '🍄', '🎵'],
  'N': ['🥜', '📰', '🪺', '9️⃣'],
  'O': ['🐙', '🍊', '🦉', '🌊'],
  'P': ['🐧', '🍕', '🥞', '🎹'],
  'Q': ['👑', '❓', '🦆', '🎯'],
  'R': ['🤖', '🌈', '🚀', '🐀'],
  'S': ['⭐', '🐍', '🦈', '☀️'],
  'T': ['🐯', '🌮', '🎾', '🚂'],
  'U': ['☂️', '🦄', '🎻', '🆙'],
  'V': ['🎻', '🚐', '🌋', '✌️'],
  'W': ['🍉', '🐋', '🌊', '⌚'],
  'X': ['❌', '🎄', '📦', '🦴'],
  'Y': ['🧶', '🍠', '🛥️', '☯️'],
  'Z': ['🦓', '⚡', '🤐', '0️⃣']
};

const LetterTracingWorksheet: React.FC<Props> = ({ data }) => {
  const { letter, difficulty, rows } = data;
  const upperLetter = letter.toUpperCase();
  const lowerLetter = letter.toLowerCase();
  
  // 获取该字母对应的图案
  const images = LETTER_IMAGES[upperLetter] || ['📝'];
  // 随机选择 2-3 个图案
  const selectedImages = images.slice(0, 2 + Math.floor(Math.random() * 2));
  
  // 根据难度决定字母大小
  const letterSize = difficulty === 'easy' ? 'text-9xl' : difficulty === 'medium' ? 'text-8xl' : 'text-7xl';
  const traceSize = difficulty === 'easy' ? 'text-6xl' : difficulty === 'medium' ? 'text-5xl' : 'text-4xl';

  return (
    <div className="w-full h-full bg-white p-8 font-sans">
      {/* 标题区域 */}
      <div className="flex items-start justify-between mb-8">
        {/* 左侧：大字母 */}
        <div className="flex-shrink-0">
          <div className={`${letterSize} font-bold text-black leading-none`}>
            {upperLetter}
          </div>
          <div className="text-2xl font-bold text-slate-600 mt-2">
            Letter {upperLetter}
          </div>
        </div>

        {/* 右侧：相关图案 */}
        <div className="flex gap-4">
          {selectedImages.map((emoji, idx) => (
            <div
              key={idx}
              className="w-20 h-20 flex items-center justify-center text-5xl bg-slate-50 rounded-xl border-2 border-black"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {/* 描红区域 */}
      <div className="space-y-6">
        {/* 大写字母描红 */}
        <div className="border-2 border-black rounded-xl p-4 bg-slate-50">
          <div className="text-sm font-bold text-slate-600 mb-2">Uppercase</div>
          <div className="flex gap-4 items-center justify-center">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className={`${traceSize} font-bold text-slate-300 tracking-wider`}
                style={{
                  textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
                  WebkitTextStroke: '2px #cbd5e1'
                }}
              >
                {upperLetter}
              </div>
            ))}
          </div>
        </div>

        {/* 小写字母描红 */}
        <div className="border-2 border-black rounded-xl p-4 bg-slate-50">
          <div className="text-sm font-bold text-slate-600 mb-2">Lowercase</div>
          <div className="flex gap-4 items-center justify-center">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className={`${traceSize} font-bold text-slate-300 tracking-wider`}
                style={{
                  textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
                  WebkitTextStroke: '2px #cbd5e1'
                }}
              >
                {lowerLetter}
              </div>
            ))}
          </div>
        </div>

        {/* 练习区域 */}
        <div className="space-y-4">
          <div className="text-sm font-bold text-slate-600">Practice Writing:</div>
          {Array.from({ length: rows }).map((_, idx) => (
            <div
              key={idx}
              className="h-20 border-2 border-dashed border-slate-300 rounded-lg bg-white"
            />
          ))}
        </div>
      </div>

      {/* 装饰元素 */}
      <div className="absolute top-4 right-4 text-3xl opacity-20">⭐</div>
      <div className="absolute bottom-4 left-4 text-3xl opacity-20">🌟</div>
      <div className="absolute bottom-4 right-4 text-3xl opacity-20">✨</div>

      {/* 页脚 */}
      <div className="mt-8 text-center text-sm text-slate-400 font-mono">
        AI Kid Print • Letter {upperLetter} Tracing
      </div>
    </div>
  );
};

export default LetterTracingWorksheet;
