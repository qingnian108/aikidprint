import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import WeeklyDeliverySettings from '../components/WeeklyDeliverySettings';
import DownloadHistory from '../components/DownloadHistory';
import PrintSettings from '../components/PrintSettings';
import PODOption from '../components/PODOption';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, getUserDownloadStats, getUserSubscription } from '../services/firestoreService';

const DashboardNew: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'delivery' | 'history' | 'settings'>('history');
  const [userPlan, setUserPlan] = useState<'Free' | 'Pro'>('Free');
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    totalDownloads: 0,
    thisWeekDownloads: 0
  });

  // 获取用户订阅计划和统计数据
  const fetchStats = async () => {
    if (currentUser) {
      console.log('🔄 Fetching stats for user:', currentUser.uid);
      try {
        // 获取用户计划
        const userData = await getUserData(currentUser.uid);
        if (userData) {
          setUserPlan(userData.plan);
        }
        
        // 获取订阅到期时间
        try {
          const subscription = await getUserSubscription(currentUser.uid);
          console.log('📅 Subscription data:', subscription);
          if (subscription && subscription.endDate) {
            // endDate 可能是 Firestore Timestamp 或 Date
            const endDateValue = subscription.endDate as any;
            const endDate = endDateValue.toDate ? endDateValue.toDate() : new Date(endDateValue);
            setSubscriptionEndDate(endDate);
          } else if (userData?.plan === 'Pro') {
            // Pro 用户但没有订阅记录，设置一个默认的到期时间（30天后）
            const defaultEndDate = new Date();
            defaultEndDate.setDate(defaultEndDate.getDate() + 30);
            setSubscriptionEndDate(defaultEndDate);
          }
        } catch (subError) {
          console.warn('获取订阅信息失败:', subError);
          // 如果是 Pro 用户，显示默认到期时间
          if (userData?.plan === 'Pro') {
            const defaultEndDate = new Date();
            defaultEndDate.setDate(defaultEndDate.getDate() + 30);
            setSubscriptionEndDate(defaultEndDate);
          }
        }
        
        // 获取下载统计数据
        const downloadStats = await getUserDownloadStats(currentUser.uid);
        console.log('📊 Dashboard stats received:', downloadStats);
        setStats(downloadStats);
      } catch (error) {
        console.error('获取用户数据失败:', error);
      }
    } else {
      console.log('⚠️ No current user, skipping stats fetch');
    }
  };

  useEffect(() => {
    console.log('🚀 Dashboard mounted, currentUser:', currentUser?.uid);
    fetchStats();
    
    // 监听下载事件，实时更新统计
    const handleDownloadComplete = () => {
      console.log('📥 Download complete event received, refreshing stats in 500ms...');
      // 延迟一点再获取，确保本地存储写入完成
      setTimeout(() => {
        fetchStats();
      }, 500);
    };
    window.addEventListener('downloadComplete', handleDownloadComplete);
    
    // 监听 storage 变化（跨标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('local_downloads_')) {
        console.log('💾 Storage change detected, refreshing stats...');
        fetchStats();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // 页面可见性变化时刷新（用户从其他标签页切换回来）
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Page became visible, refreshing stats...');
        fetchStats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('downloadComplete', handleDownloadComplete);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser]);

  const tabs = [
    { id: 'history', label: 'Download History', icon: '📥' },
    { id: 'delivery', label: 'Weekly Delivery', icon: '📅' },
    { id: 'settings', label: 'Print Settings', icon: '🖨️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-duck-yellow/5 via-white to-duck-blue/5 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-display font-black text-black mb-2">
                Dashboard
              </h1>
              {userPlan === 'Pro' && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-duck-yellow to-duck-orange border-2 border-black px-4 py-2 rounded-full">
                    <Crown size={20} className="fill-current" />
                    <span className="font-bold text-sm">PRO MEMBER</span>
                  </div>
                  {subscriptionEndDate && (
                    <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-2 rounded-full text-sm">
                      <Calendar size={14} className="text-slate-500" />
                      <span className="font-mono text-slate-600">
                        Expires: {format(subscriptionEndDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/weekly-pack"
                className="brutal-btn bg-duck-green text-black border-2 border-black px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              >
                <Sparkles size={18} />
                Generate Pack
              </Link>
              {userPlan === 'Free' && (
                <Link
                  to="/pricing"
                  className="brutal-btn bg-duck-yellow text-black border-2 border-black px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                >
                  <TrendingUp size={18} />
                  Upgrade to Pro
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards - 只显示下载统计，均匀分布 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          {[
            { label: 'Total Downloads', value: stats.totalDownloads.toString(), icon: '📥', color: 'bg-duck-blue' },
            { label: 'This Week', value: stats.thisWeekDownloads.toString(), icon: '📅', color: 'bg-duck-green' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white border-3 border-black rounded-xl shadow-brutal p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-mono text-slate-600 mb-1">{stat.label}</div>
                  <div className="text-4xl font-display font-black">{stat.value}</div>
                </div>
                <div className={`${stat.color} border-2 border-black rounded-xl p-4 text-3xl`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white border-3 border-black rounded-2xl shadow-brutal p-2 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[140px] px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-duck-blue border-2 border-black shadow-brutal-sm'
                    : 'hover:bg-slate-50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'history' && <DownloadHistory />}
          {activeTab === 'delivery' && <WeeklyDeliverySettings />}
          {activeTab === 'settings' && <PrintSettings />}
        </motion.div>

        {/* POD Option - Print on Demand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <PODOption />
        </motion.div>

        {/* Pro Upgrade Banner (for free users) */}
        {userPlan === 'Free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-duck-yellow via-duck-blue to-duck-pink border-4 border-black rounded-2xl shadow-brutal-lg p-12 text-center"
          >
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-4xl font-display font-black mb-4">
              Unlock the Full Experience
            </h2>
            <p className="text-xl font-mono mb-8 max-w-2xl mx-auto">
              Upgrade to Pro for unlimited downloads, weekly auto-delivery, and all premium themes
            </p>
            <Link
              to="/pricing"
              className="inline-block brutal-btn bg-black text-white border-3 border-white px-12 py-5 rounded-2xl font-bold text-xl shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
            >
              Upgrade to Pro →
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardNew;
