import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, User, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logOut } = useAuth();

  const isActive = (path: string) => location.pathname === path ? 'text-black font-bold underline decoration-4 decoration-duck-yellow underline-offset-4 -translate-y-1' : 'text-slate-600 hover:text-black hover:-translate-y-1';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Worksheets', path: '/generator' },
    { name: 'Weekly Pack', path: '/weekly-pack' },
    { name: 'Custom Pack', path: '/custom-pack' },
    // { name: 'Library', path: '/library' }, // TODO: 暂时隐藏，页面内容未完成
    { name: 'Pricing', path: '/pricing' },
    { name: 'Account', path: currentUser ? '/dashboard' : '/login' },
  ];

  const handleLogout = async () => {
    try {
      await logOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body overflow-x-hidden">
      {/* Fixed Header Container - Banner + Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 no-print">
        {/* Top Banner */}
        <div className="bg-duck-yellow py-2 px-4 text-center text-xs md:text-sm font-bold border-b-2 border-black relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
          <Link to="/generator" className="hover:underline flex items-center justify-center gap-2 relative z-10 hover:scale-105 transition-transform">
            CREATE PERSONALIZED WORKSHEETS IN SECONDS <ArrowRight size={14} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="bg-paper/95 backdrop-blur-md border-b-2 border-black transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group hover-wiggle">
              <img src="/logo/logo.png" alt="AI Kid Print" className="h-12 w-auto object-contain" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className={`${isActive(link.path)} transition-all font-bold uppercase tracking-wide text-sm`}>
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {currentUser ? (
                <>
                  <Link to="/dashboard" className="text-black font-bold uppercase text-sm hover:underline hover:text-duck-blue transition-colors flex items-center gap-2">
                    <User size={16} />
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-black font-bold uppercase text-sm hover:underline hover:text-red-500 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-black font-bold uppercase text-sm hover:underline hover:text-duck-blue transition-colors">Log In</Link>
                  <Link to="/generator" className="bg-duck-blue hover:bg-duck-green text-black border-2 border-black px-6 py-2 rounded-xl font-bold shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 active:translate-y-0 active:shadow-brutal-sm transition-all flex items-center gap-2 uppercase text-sm group">
                    <Sparkles size={16} className="group-hover:rotate-12 transition-transform"/> Start Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-black p-2 border-2 border-black rounded-lg bg-white shadow-brutal-sm active:translate-y-1 active:shadow-none transition-all">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-paper border-b-2 border-black absolute w-full z-50 animate-fade-scale origin-top">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className="block px-3 py-3 text-base font-bold uppercase border-b-2 border-slate-100 hover:bg-duck-yellow/20 text-black rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {currentUser ? (
                <>
                  <div className="pt-4 border-t-2 border-slate-100">
                    <div className="px-3 py-2 text-sm font-bold text-slate-600">
                      Signed in as: {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </div>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-3 text-base font-bold uppercase border-b-2 border-slate-100 hover:bg-duck-yellow/20 text-black rounded-lg transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-3 text-base font-bold uppercase border-b-2 border-slate-100 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-6 grid grid-cols-2 gap-4">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex justify-center items-center gap-2 px-4 py-3 border-2 border-black bg-white rounded-lg shadow-brutal-sm text-black font-bold uppercase text-sm active:shadow-none active:translate-y-1">
                    <User size={18} /> Login
                  </Link>
                  <Link to="/generator" onClick={() => setIsMenuOpen(false)} className="flex justify-center items-center gap-2 px-4 py-3 bg-duck-blue border-2 border-black rounded-lg text-black font-bold uppercase text-sm shadow-brutal-sm active:shadow-none active:translate-y-1">
                    <Sparkles size={18} /> Start
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      </header>

      {/* Spacer for fixed header (banner ~40px + nav ~80px = ~120px) */}
      <div className="h-[120px] md:h-[112px]"></div>

      {/* Main Content */}
      <main className="flex-grow relative">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-black py-16 mt-auto no-print relative overflow-hidden">
        {/* Footer Decor */}
        <div className="absolute -right-10 -bottom-10 text-duck-yellow opacity-20 animate-spin-slow">
            <Sparkles size={200} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                <img src="/logo/logo.png" alt="AI Kid Print" className="h-10 w-auto object-contain" />
              </Link>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Making personalized learning accessible, fun, and unlimited for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-bold font-mono text-black uppercase tracking-wider mb-6 text-sm border-b-2 border-duck-yellow inline-block">Product</h4>
              <ul className="space-y-3 text-sm text-slate-600 font-medium">
                <li><Link to="/generator" className="hover:text-black hover:translate-x-1 inline-block transition-transform">Generator</Link></li>
                <li><Link to="/pricing" className="hover:text-black hover:translate-x-1 inline-block transition-transform">Pricing</Link></li>
                <li><Link to="/dashboard" className="hover:text-black hover:translate-x-1 inline-block transition-transform">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold font-mono text-black uppercase tracking-wider mb-6 text-sm border-b-2 border-duck-green inline-block">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-600 font-medium">
                <li><Link to="/free-resources" className="hover:text-black hover:translate-x-1 inline-block transition-transform">Free Alphabet</Link></li>
                <li><Link to="/free-resources" className="hover:text-black hover:translate-x-1 inline-block transition-transform">Math Sheets</Link></li>
                <li><Link to="/free-resources" className="hover:text-black hover:translate-x-1 inline-block transition-transform">Coloring Pages</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold font-mono text-black uppercase tracking-wider mb-6 text-sm border-b-2 border-duck-orange inline-block">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-600 font-medium">
                <li><Link to="/privacy" className="hover:text-black hover:translate-x-1 inline-block transition-transform">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-black hover:translate-x-1 inline-block transition-transform">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t-2 border-slate-100 text-center text-slate-500 text-sm font-mono">
            &copy; {new Date().getFullYear()} AI Kid Print. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
