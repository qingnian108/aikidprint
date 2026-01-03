import React, { useEffect, useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { BarChart } from '../components/Charts';

interface WorksheetTypeStat {
  type: string;
  count: number;
}

interface ThemeStat {
  theme: string;
  count: number;
}

const ContentStats: React.FC = () => {
  const [worksheetStats, setWorksheetStats] = useState<WorksheetTypeStat[]>([]);
  const [themeStats, setThemeStats] = useState<ThemeStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [contentRes, themeRes] = await Promise.all([
        adminApi.getContentStats(startDate, endDate),
        adminApi.getThemeStats(),
      ]);

      if (contentRes.success) {
        setWorksheetStats(contentRes.data.worksheetTypes || []);
      }
      if (themeRes.success) {
        setThemeStats(themeRes.data.themes || []);
      }
    } catch (error) {
      console.error('Failed to fetch content stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  // 转换工作表类型数据为图表格式
  const worksheetChartData = worksheetStats.map((item) => ({
    label: item.type,
    value: item.count,
  }));

  // 转换主题数据为图表格式（取前10）
  const themeChartData = themeStats.slice(0, 10).map((item) => ({
    label: item.theme.length > 8 ? item.theme.substring(0, 8) + '...' : item.theme,
    value: item.count,
  }));

  // 计算总生成数
  const totalGenerations = worksheetStats.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">内容统计</h2>
        <p className="text-gray-500 text-sm mt-1">查看工作表生成统计和热门主题</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">日期范围:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="text-gray-400">至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const date = new Date();
                date.setDate(date.getDate() - 7);
                setStartDate(date.toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              近7天
            </button>
            <button
              onClick={() => {
                const date = new Date();
                date.setDate(date.getDate() - 30);
                setStartDate(date.toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              近30天
            </button>
            <button
              onClick={() => {
                const date = new Date();
                date.setDate(date.getDate() - 90);
                setStartDate(date.toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              近90天
            </button>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={24} />
          <span className="text-purple-100">总生成数量</span>
        </div>
        <p className="text-4xl font-bold">{totalGenerations.toLocaleString()}</p>
        <p className="text-purple-200 text-sm mt-1">
          {startDate} 至 {endDate}
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Worksheet Type Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">工作表类型分布</h3>
          <BarChart data={worksheetChartData} height={300} color="#8B5CF6" loading={loading} />
        </div>

        {/* Theme Popularity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">热门主题 Top 10</h3>
          <BarChart data={themeChartData} height={300} color="#F59E0B" loading={loading} />
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Worksheet Types */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">工作表类型详情</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-400">加载中...</div>
            ) : worksheetStats.length === 0 ? (
              <div className="p-8 text-center text-gray-400">暂无数据</div>
            ) : (
              worksheetStats.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{item.type}</span>
                  </div>
                  <span className="text-gray-600">{item.count.toLocaleString()} 次</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Themes */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">主题排行榜</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">加载中...</div>
            ) : themeStats.length === 0 ? (
              <div className="p-8 text-center text-gray-400">暂无数据</div>
            ) : (
              themeStats.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index < 3
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{item.theme}</span>
                  </div>
                  <span className="text-gray-600">{item.count.toLocaleString()} 次</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentStats;
