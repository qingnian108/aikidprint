import React from 'react';
import { Link } from 'react-router-dom';
import { Download, ArrowRight } from 'lucide-react';

const FreeResources: React.FC = () => {
  const resources = [
    { title: 'Alphabet Tracing A-Z', category: 'Tracing', color: 'bg-duck-orange' },
    { title: 'Numbers 1-10', category: 'Math', color: 'bg-duck-blue' },
    { title: 'Farm Animals Coloring', category: 'Coloring', color: 'bg-duck-green' },
    { title: 'Shape Recognition', category: 'Math', color: 'bg-duck-yellow' },
    { title: 'Sight Words: Level 1', category: 'Reading', color: 'bg-purple-400' },
    { title: 'Simple Mazes', category: 'Logic', color: 'bg-pink-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <div className="inline-block animate-bounce mb-2 text-4xl">🎁</div>
        <h1 className="text-5xl font-display font-black text-black mb-6 uppercase tracking-tight">Free Resources</h1>
        <p className="text-slate-600 font-mono uppercase max-w-2xl mx-auto bg-white inline-block px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          Instant downloads. No signup required.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {resources.map((res, i) => (
            <div 
                key={i} 
                className="group bg-white border-2 border-black rounded-2xl shadow-brutal hover:shadow-brutal-lg transition-all duration-300 cursor-pointer relative overflow-hidden hover:-translate-y-2 animate-pop-in"
                style={{ animationDelay: `${i * 100}ms` }}
            >
                <div className={`h-48 ${res.color} border-b-2 border-black flex items-center justify-center overflow-hidden relative`}>
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,_#000_2px,_transparent_2px)] bg-[length:16px_16px]"></div>
                    
                    <span className="text-white text-7xl font-display font-bold opacity-90 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 drop-shadow-md">
                        {res.category === 'Math' ? '123' : res.category === 'Tracing' ? 'Aa' : '🎨'}
                    </span>
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                         <div className="text-xs font-bold text-black font-mono uppercase tracking-wider border border-black px-2 py-0.5 rounded bg-slate-100">{res.category}</div>
                    </div>
                    <h3 className="text-2xl font-bold text-black font-display mb-6 leading-tight">{res.title}</h3>
                    <Link to="/generator" className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-black text-black font-bold text-sm uppercase hover:bg-black hover:text-white transition-colors rounded-lg">
                        <Download size={16} /> Download PDF
                    </Link>
                </div>
            </div>
        ))}
      </div>
      
      <div className="mt-20 bg-white border-2 border-black rounded-3xl p-12 text-center shadow-brutal-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-black font-display mb-4 uppercase">Want something specific?</h2>
            <p className="text-slate-600 font-mono mb-8">Generate a custom dinosaur-themed math worksheet in seconds.</p>
            <Link to="/generator" className="inline-flex items-center gap-2 bg-duck-yellow border-2 border-black text-black px-8 py-4 rounded-xl font-bold shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all uppercase">
                Open Generator <ArrowRight size={20} />
            </Link>
          </div>
          {/* Animated Background Decor */}
          <div className="absolute top-0 left-0 w-full h-4 bg-duck-blue"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-duck-green rounded-full mix-blend-multiply opacity-20 filter blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute top-10 left-10 w-12 h-12 border-4 border-duck-orange rounded-full opacity-30 animate-float"></div>
      </div>
    </div>
  );
};

export default FreeResources;