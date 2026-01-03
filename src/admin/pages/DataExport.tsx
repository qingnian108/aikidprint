import React, { useState } from 'react';
import { adminApi } from '../services/adminApi';

interface ExportType {
  key: 'users' | 'subscriptions' | 'payments' | 'usage';
  label: string;
  description: string;
  icon: string;
}

const exportTypes: ExportType[] = [
  {
    key: 'users',
    label: '用户数据',
    description: '导出所有用户信息，包括邮箱、计划、注册时间等',
    icon: '👥',
  },
  {
    key: 'subscriptions',
    label: '订阅数据',
    description: '导出所有订阅记录，包括状态、开始/结束时间等',
    icon: '📋',
  },
  {
    key: 'payments',
    label: '支付数据',
    description: '导出所有支付记录，包括金额、状态、PayPal订单号等',
    icon: '💳',
  },
  {
    key: 'usage',
    label: '使用数据',
    description: '导出每日使用统计，包括生成次数、日期等',
    icon: '📊',
  },
];

const DataExport: React.FC = () => {
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleExport = async (type: 'users' | 'subscriptions' | 'payments' | 'usage') => {
    try {
      setExporting(type);
      setError(null);
      setSuccess(null);
      
      await adminApi.downloadExport(type);
      
      setSuccess(`${getTypeLabel(type)}导出成功`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败，请重试');
    } finally {
      setExporting(null);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      users: '用户数据',
      subscriptions: '订阅数据',
      payments: '支付数据',
      usage: '使用数据',
    };
    return labels[type] || type;
  };


  const setQuickDateRange = (range: 'week' | 'month' | 'quarter' | 'year') => {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const clearDateRange = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">数据导出</h2>
        <p className="text-gray-500 text-sm mt-1">导出平台数据用于分析和报告</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
            ✕
          </button>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">日期范围筛选（可选）</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">开始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">结束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setQuickDateRange('week')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              近7天
            </button>
            <button
              onClick={() => setQuickDateRange('month')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              近30天
            </button>
            <button
              onClick={() => setQuickDateRange('quarter')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              近3个月
            </button>
            <button
              onClick={() => setQuickDateRange('year')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              近1年
            </button>
          </div>
          {(startDate || endDate) && (
            <button
              onClick={clearDateRange}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              清除
            </button>
          )}
        </div>
        {(startDate || endDate) && (
          <p className="text-xs text-gray-500 mt-2">
            注意：日期筛选仅对支付数据和使用数据有效
          </p>
        )}
      </div>


      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportTypes.map((exportType) => (
          <div
            key={exportType.key}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{exportType.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{exportType.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{exportType.description}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => handleExport(exportType.key)}
                disabled={exporting !== null}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  exporting === exportType.key
                    ? 'bg-indigo-100 text-indigo-600 cursor-wait'
                    : exporting !== null
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {exporting === exportType.key ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>导出中...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span>导出 CSV</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Export Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-800 mb-2">导出说明</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 所有数据将以 CSV 格式导出，可用 Excel 或其他表格软件打开</li>
          <li>• 文件名包含导出日期，格式为：类型-YYYY-MM-DD.csv</li>
          <li>• 大量数据导出可能需要较长时间，请耐心等待</li>
          <li>• 导出的数据仅供内部分析使用，请妥善保管</li>
        </ul>
      </div>
    </div>
  );
};

export default DataExport;
