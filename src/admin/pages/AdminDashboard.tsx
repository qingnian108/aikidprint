import React, { useEffect, useState } from 'react';
import { Users, CreditCard, FileText, DollarSign } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import StatsCard from '../components/StatsCard';
import { LineChart, BarChart } from '../components/Charts';

interface StatsOverview {
  totalUsers: number;
  activeSubscribers: number;
  todayGenerations: number;
  monthlyRevenue: number;
}

interface GrowthData {
  date: string;
  count: number;
}

interface UsageData {
  date: string;
  count: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [userGrowth, setUserGrowth] = useState<GrowthData[]>([]);
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 并行获取所有数据
        const [overviewRes, growthRes, usageRes] = await Promise.all([
          adminApi.getStatsOverview(),
          adminApi.getUserGrowthStats(30),
          adminApi.getUsageStats(7),
        ]);

        if (overviewRes.success) {
          setStats(overviewRes.data);
        }
        if (growthRes.success) {
          setUserGrowth(growthRes.data || []);
        }
        if (usageRes.success) {
          setUsageData(usageRes.data || []);
        }
      } catch (err: any) {
        setError(err.message || '获取统计数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 格式化日期标签
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 转换用户增长数据为图表格式
  const userGrowthChartData = userGrowth.map((item) => ({
    label: formatDateLabel(item.date),
    value: item.count,
  }));

  // 转换使用量数据为图表格式
  const usageChartData = usageData.map((item) => ({
    label: formatDateLabel(item.date),
    value: item.count,
  }));

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">概览</h2>
        <p className="text-gray-500 text-sm mt-1">平台关键指标一览</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="总用户数"
          value={stats?.totalUsers?.toLocaleString() || 0}
          icon={<Users size={24} />}
          color="blue"
          loading={isLoading}
        />
        <StatsCard
          title="活跃订阅"
          value={stats?.activeSubscribers?.toLocaleString() || 0}
          icon={<CreditCard size={24} />}
          color="green"
          loading={isLoading}
        />
        <StatsCard
          title="今日生成"
          value={stats?.todayGenerations?.toLocaleString() || 0}
          icon={<FileText size={24} />}
          color="purple"
          loading={isLoading}
        />
        <StatsCard
          title="本月收入"
          value={`$${stats?.monthlyRevenue?.toFixed(2) || '0.00'}`}
          icon={<DollarSign size={24} />}
          color="orange"
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">用户增长趋势（近30天）</h3>
          <LineChart data={userGrowthChartData} height={250} color="#3B82F6" loading={isLoading} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">每日生成量（近7天）</h3>
          <BarChart data={usageChartData} height={250} color="#8B5CF6" loading={isLoading} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">快捷操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="#/admin/users"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Users size={24} className="text-blue-600 mb-2" />
            <span className="text-sm text-gray-600">用户管理</span>
          </a>
          <a
            href="#/admin/subscriptions"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <CreditCard size={24} className="text-green-600 mb-2" />
            <span className="text-sm text-gray-600">订阅管理</span>
          </a>
          <a
            href="#/admin/content"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FileText size={24} className="text-purple-600 mb-2" />
            <span className="text-sm text-gray-600">内容统计</span>
          </a>
          <a
            href="#/admin/export"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <DollarSign size={24} className="text-orange-600 mb-2" />
            <span className="text-sm text-gray-600">数据导出</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
