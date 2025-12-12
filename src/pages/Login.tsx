import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { googleSignIn, emailSignIn, emailSignUp } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await googleSignIn();
      
      // 检查是否有待恢复的页面
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      const pendingPackId = sessionStorage.getItem('pendingPackId');
      
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else if (pendingPackId) {
        navigate(`/weekly-pack/preview/${pendingPackId}`);
      } else if (isSignUp) {
        navigate('/weekly-pack');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError(error.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      if (isSignUp) {
        // 新用户注册
        await emailSignUp(email, password);
      } else {
        // 老用户登录
        await emailSignIn(email, password);
      }
      
      // 检查是否有待恢复的页面
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      const pendingPackId = sessionStorage.getItem('pendingPackId');
      
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else if (pendingPackId) {
        navigate(`/weekly-pack/preview/${pendingPackId}`);
      } else if (isSignUp) {
        navigate('/weekly-pack');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setError('User not found. Check the email or sign up.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please sign in instead.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(error.message || 'Action failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-10 border-2 border-black shadow-brutal max-w-md w-full relative">
        {/* Decor */}
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-duck-orange border-2 border-black"></div>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold text-black uppercase">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-600 font-mono text-sm mt-2">
            {isSignUp ? 'Sign up to save your worksheets' : 'Sign in to access your saved worksheets'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-600 font-bold text-center font-mono text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 border-2 border-black flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] font-bold font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
          </button>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs font-bold uppercase">
              <span className="px-2 bg-white text-slate-400">or use email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-black mb-2 font-mono flex items-center gap-2">
                <Mail size={14} /> Email address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:shadow-brutal transition-shadow font-mono text-sm" 
                placeholder="parent@example.com" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase text-black mb-2 font-mono flex items-center gap-2">
                <Lock size={14} /> Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:shadow-brutal transition-shadow font-mono text-sm pr-10" 
                  placeholder="At least 6 characters" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white border-2 border-black py-4 font-bold hover:bg-slate-800 transition-all shadow-brutal active:shadow-none active:translate-y-[2px] mt-6 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-duck-blue font-bold font-mono text-sm hover:underline"
            >
              {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
