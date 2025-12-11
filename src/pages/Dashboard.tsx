import React, { useState, useEffect } from 'react';
import { Clock, Download, Sparkles, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, getUserSubscription } from '../services/firestoreService';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [userPlan, setUserPlan] = useState<'Free' | 'Pro'>('Free');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string>('');
  
  // Mock Data
  const history = [
    { id: 1, title: 'Dino Math', type: 'Math', date: '2 hours ago', pages: 1 },
    { id: 2, title: 'Space Tracing', type: 'Tracing', date: 'Yesterday', pages: 3 },
    { id: 3, title: 'Princess Colors', type: 'Coloring', date: '3 days ago', pages: 1 },
  ];
  
  // Load user subscription info
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!currentUser) return;
      
      try {
        const userData = await getUserData(currentUser.uid);
        if (userData) {
          setUserPlan(userData.plan);
        }
        
        const subscription = await getUserSubscription(currentUser.uid);
        if (subscription) {
          const endDate = subscription.endDate.toDate();
          setSubscriptionEnd(endDate.toLocaleDateString('en-US'));
        }
      } catch (error) {
        console.error('Failed to load user info:', error);
      }
    };
    
    loadUserInfo();
  }, [currentUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-display font-bold text-black uppercase">Dashboard</h1>
          {userPlan === 'Pro' && (
            <div className="mt-2 flex items-center gap-2 text-duck-yellow">
              <Crown size={20} className="fill-current" />
              <span className="font-bold font-mono text-sm">
                PRO USER {subscriptionEnd && `- Expires: ${subscriptionEnd}`}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Link to="/generator" className="bg-duck-green border-2 border-black text-black px-6 py-3 font-bold flex items-center gap-2 hover:shadow-brutal transition-shadow uppercase text-sm">
              <Sparkles size={18} /> New Worksheet
          </Link>
        </div>
      </div>
      
      {/* User Plan Card */}
      <div className="mb-10 p-6 border-2 border-black bg-white shadow-brutal">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-display mb-2 uppercase">Current Plan</h3>
            <p className="text-3xl font-black font-display text-duck-yellow">
              {userPlan === 'Pro' ? '🌟 PRO' : '🆓 FREE'}
            </p>
          </div>
          {userPlan === 'Free' && (
            <Link 
              to="/pricing"
              className="bg-duck-yellow border-2 border-black px-6 py-3 font-bold hover:shadow-brutal transition-shadow uppercase"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white border-2 border-black shadow-brutal overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-black bg-slate-50 flex items-center gap-2">
            <Clock size={18} className="text-black" />
            <h2 className="font-bold text-black font-mono uppercase">Recent Activity</h2>
        </div>
        
        {history.length > 0 ? (
            <div className="divide-y-2 divide-slate-100">
                {history.map((item) => (
                    <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 border-2 border-black bg-white flex items-center justify-center text-2xl shadow-sm group-hover:shadow-brutal-sm transition-shadow">
                                {item.type === 'Math' ? '🧮' : item.type === 'Tracing' ? '✏️' : '🎨'}
                            </div>
                            <div>
                                <h3 className="font-bold text-black text-lg font-display">{item.title}</h3>
                                <p className="text-sm text-slate-500 font-mono uppercase mt-1">{item.type} • {item.pages} Page(s) • {item.date}</p>
                            </div>
                        </div>
                        <button className="text-black hover:bg-duck-yellow p-3 border-2 border-transparent hover:border-black hover:shadow-brutal transition-all rounded-none">
                            <Download size={20} />
                        </button>
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-16 text-center">
                <p className="text-slate-400 font-mono">NO HISTORY YET. START CREATING!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;