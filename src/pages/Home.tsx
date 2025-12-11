import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, User, Code, Printer } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { TESTIMONIALS } from '../constants';
import NameInputHero from '../components/NameInputHero';
import SocialProof from '../components/SocialProof';
import SampleGallery from '../components/SampleGallery';

// Decorative Components
const FloatingShape = ({ 
  type, 
  color, 
  size, 
  top, 
  left, 
  right, 
  bottom, 
  delay = 0, 
  duration = 6,
  rotate = 0
}: any) => {
  const style = {
    top, left, right, bottom,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  };
  
  const className = `absolute pointer-events-none animate-float opacity-80 z-0 ${color}`;

  if (type === 'circle') {
    return <div className={`${className} rounded-full border-2 border-black shadow-brutal-sm`} style={{ ...style, width: size, height: size }}></div>;
  }
  if (type === 'square') {
    return <div className={`${className} border-2 border-black shadow-brutal-sm`} style={{ ...style, width: size, height: size, transform: `rotate(${rotate}deg)` }}></div>;
  }
  if (type === 'triangle') {
    return (
      <div className={`${className} w-0 h-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-current drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]`} 
           style={{ ...style, borderBottomColor: 'inherit', color: 'inherit', transform: `rotate(${rotate}deg)` }}>
      </div>
    );
  }
  return null;
};

const Cloud = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 45C4.477 45 0 40.523 0 35C0 29.477 4.477 25 10 25C10.9 25 11.76 25.15 12.58 25.42C13.64 16.88 20.88 10 30 10C32.18 10 34.24 10.4 36.14 11.12C39.26 4.36 46.12 0 54 0C65.05 0 74 8.95 74 20C74 20.95 73.92 21.88 73.77 22.79C76.28 20.44 79.68 19 83 19C91.28 19 98 25.72 98 34C98 41.59 92.4 47.88 85.15 48.82C84.46 48.93 83.74 49 83 49H10V45Z" />
    <path d="M10 45H83C91.28 45 98 38.28 98 30C98 21.72 91.28 15 83 15C79.68 15 76.28 16.44 73.77 18.79C73.92 17.88 74 16.95 74 16C74 4.95 65.05 -4 54 -4C46.12 -4 39.26 0.36 36.14 7.12C34.24 6.4 32.18 6 30 6C20.88 6 13.64 12.88 12.58 21.42C11.76 21.15 10.9 21 10 21C4.477 21 0 25.477 0 31C0 36.523 4.477 41 10 41Z" stroke="black" strokeWidth="2.5" fill="white"/>
  </svg>
);

const Home: React.FC = () => {
  // Refs for scroll-triggered animations
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  
  // Check if sections are in view
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  return (
    <div className="flex flex-col gap-0 pb-20 overflow-hidden relative">
      
      {/* Floating Background Elements (Global for Home) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <FloatingShape type="circle" color="bg-duck-yellow" size="40px" top="10%" left="5%" delay={0} />
         <FloatingShape type="square" color="bg-duck-blue" size="30px" top="20%" right="10%" delay={1.5} rotate={15} />
         <FloatingShape type="triangle" color="text-duck-orange" size="20px" bottom="30%" left="8%" delay={0.5} rotate={-10} />
         <FloatingShape type="circle" color="bg-duck-green" size="50px" bottom="15%" right="5%" delay={2} />
         <FloatingShape type="square" color="bg-duck-pink" size="25px" top="40%" left="45%" delay={3} rotate={45} />
      </div>

      {/* Hero Section - Name Input */}
      <NameInputHero />

      {/* Sample Gallery Section */}
      <SampleGallery />

      {/* Social Proof Section */}
      <SocialProof />

      {/* How it works */}
      <section ref={howItWorksRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t-2 border-black bg-white relative">
        <div className="text-center mb-16 relative z-10">
          <div className="inline-block bg-black text-white px-4 py-1 font-mono text-sm font-bold uppercase mb-4 rounded-full">Simple Process</div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-black mb-4 uppercase tracking-tight">How It Works</h2>
          <p className="text-slate-600 font-mono text-lg">From idea to printer in 3 steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
           {[
             { icon: User, title: '1. INPUT DATA', desc: 'Tell us the age, subject, and what they love (e.g. Space, Cats).', color: 'bg-duck-yellow' },
             { icon: Code, title: '2. AI GENERATES', desc: 'Our smart engine builds a unique PDF just for your child.', color: 'bg-duck-blue' },
             { icon: Printer, title: '3. PRINT & PLAY', desc: 'Download the PDF instantly and start learning offline.', color: 'bg-duck-green' }
           ].map((step, idx) => (
             <motion.div 
               key={idx} 
               initial={{ opacity: 0, y: 50 }}
               animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
               transition={{ duration: 0.5, delay: idx * 0.2 }}
               className="bg-white p-8 border-2 border-black shadow-brutal rounded-2xl hover:shadow-brutal-lg hover:-translate-y-2 transition-all cursor-default group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 ${step.color} rounded-bl-full -mr-4 -mt-4 opacity-20 group-hover:scale-150 transition-transform duration-500`}></div>
                
                <div className={`w-16 h-16 ${step.color} border-2 border-black rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-sm`}>
                   <step.icon size={32} strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-black font-display mb-3">{step.title}</h3>
                <p className="text-slate-600 font-mono text-sm leading-relaxed">{step.desc}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Features / Value Props */}
      <section ref={featuresRef} className="py-20 bg-paper border-t-2 border-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="bg-duck-green border-2 border-black p-10 md:p-20 shadow-brutal-lg rounded-3xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="flex-1 text-black">
                      <h2 className="text-4xl md:text-5xl font-display font-black mb-8 leading-tight">WHY PARENTS ❤️<br/>AI KID PRINT</h2>
                      <ul className="space-y-6 text-lg font-bold text-black">
                          <li className="flex items-center gap-4 animate-pop-in" style={{animationDelay: '0.1s'}}>
                              <div className="bg-white border-2 border-black p-2 rounded-lg shadow-sm"><ArrowRight size={20} /></div> 
                              Infinite Content Supply
                          </li>
                          <li className="flex items-center gap-4 animate-pop-in" style={{animationDelay: '0.2s'}}>
                              <div className="bg-white border-2 border-black p-2 rounded-lg shadow-sm"><ArrowRight size={20} /></div> 
                              Zero Prep Time Required
                          </li>
                          <li className="flex items-center gap-4 animate-pop-in" style={{animationDelay: '0.3s'}}>
                              <div className="bg-white border-2 border-black p-2 rounded-lg shadow-sm"><ArrowRight size={20} /></div> 
                              Personalized to Interests
                          </li>
                      </ul>
                      <Link to="/generator" className="inline-block mt-12 bg-black text-white px-8 py-4 font-bold rounded-xl hover:bg-white hover:text-black hover:border-black border-2 border-transparent transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                          START CREATING NOW
                      </Link>
                  </div>
                  
                  {/* Stacked Testimonials */}
                  <div className="flex-1 flex flex-col gap-6 relative">
                      {TESTIMONIALS.map((t, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 30, rotate: 0 }}
                            animate={featuresInView ? { 
                              opacity: 1, 
                              y: 0, 
                              rotate: i % 2 === 0 ? -2 : 2 
                            } : {}}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                            className={`bg-white border-2 border-black p-6 shadow-brutal rounded-xl w-full md:w-80 self-center md:self-end transform transition-transform duration-500 hover:scale-105 hover:rotate-1 ${i % 2 === 0 ? 'md:-translate-x-12' : ''}`}>
                              <div className="flex gap-1 text-duck-orange mb-2">
                                  {[...Array(5)].map((_,i) => <Star key={i} size={16} fill="currentColor" strokeWidth={1.5} stroke="black" />)}
                              </div>
                              <p className="text-sm font-medium font-mono mb-4 italic">"{t.text}"</p>
                              <div className="flex items-center gap-3 border-t-2 border-slate-100 pt-3">
                                  <div className="w-10 h-10 bg-slate-200 border-2 border-black rounded-full overflow-hidden">
                                      <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="text-xs">
                                      <div className="font-bold uppercase">{t.name}</div>
                                      <div className="text-slate-500">{t.role}</div>
                                  </div>
                              </div>
                          </motion.div>
                      ))}
                  </div>
              </div>
              
              {/* Big Decor Circle */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl opacity-60 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-overlay filter blur-3xl opacity-60 pointer-events-none"></div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;