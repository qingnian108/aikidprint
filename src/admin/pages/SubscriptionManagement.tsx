import React, { useEffect, useState, useCallback } from 'react';
import { Search, X, Calendar, XCircle, AlertTriangle } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import DataTable, { Column } from '../components/DataTable';

interface Subscription {
  subscriptionId: string;
  userId: string;
  userEmail: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

const SubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // Modal states
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [extendDays, setExtendDays] = useState(30);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSubscriptions(page, pageSize, search || undefined);
      if (response.success) {
        // 后端返回 items，兼容 subscriptions
        setSubscriptions(response.data.items || response.data.subscriptions || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubscriptions();
  };

  const handleExtend = async () => {
    if (!selectedSubscription) return;
    setActionLoading(true);
    try {
      const response = await adminApi.extendSubscription(
        selectedSubscription.subscriptionId,
        extendDays
      );
      if (response.success) {
        setShowExtendModal(false);
        setSelectedSubscription(null);
        setExtendDays(30);
        fetchSubscriptions();
      }
    } catch (error) {
      console.error('Failed to extend subscription:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedSubscription) return;
    setActionLoading(true);
    try {
      const response = await adminApi.cancelSubscription(selectedSubscription.subscriptionId);
      if (response.success) {
        setShowCancelModal(false);
        setSelectedSubscription(null);
        fetchSubscriptions();
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-600',
    };
    const labels: Record<string, string> = {
      active: '活跃',
      cancelled: '已取消',
      expired: '已过期',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.expired}`}>
        {labels[status] || status}
      </span>
    );
  };

  const columns: Column<Subscription>[] = [
    {
      key: 'userEmail',
      title: '用户邮箱',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'plan',
      title: '计划',
      width: '80px',
      render: (value) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: '100px',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'startDate',
      title: '开始日期',
      width: '120px',
      render: (value) => <span className="text-gray-500">{formatDate(value)}</span>,
    },
    {
      key: 'endDate',
      title: '结束日期',
      width: '120px',
      render: (value) => <span className="text-gray-500">{formatDate(value)}</span>,
    },
    {
      key: 'autoRenew',
      title: '自动续费',
      width: '80px',
      align: 'center',
      render: (value) => (
        <span className={value ? 'text-green-600' : 'text-gray-400'}>
          {value ? '是' : '否'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: '160px',
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-2">
          {record.status === 'active' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSubscription(record);
                  setShowExtendModal(true);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
              >
                <Calendar size={14} />
                延期
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSubscription(record);
                  setShowCancelModal(true);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
              >
                <XCircle size={14} />
                取消
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">订阅管理</h2>
        <p className="text-gray-500 text-sm mt-1">管理用户订阅和计划</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索用户邮箱..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          搜索
        </button>
      </form>

      {/* Table */}
      <DataTable
        columns={columns}
        data={subscriptions}
        loading={loading}
        rowKey="subscriptionId"
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: setPage,
        }}
      />

      {/* Extend Modal */}
      {showExtendModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">延期订阅</h3>
              <button
                onClick={() => setShowExtendModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                为用户 <span className="font-medium">{selectedSubscription.userEmail}</span> 延期订阅
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  延期天数
                </label>
                <select
                  value={extendDays}
                  onChange={(e) => setExtendDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value={7}>7 天</option>
                  <option value={14}>14 天</option>
                  <option value={30}>30 天</option>
                  <option value={60}>60 天</option>
                  <option value={90}>90 天</option>
                </select>
              </div>
              <p className="text-sm text-gray-500">
                当前结束日期: {formatDate(selectedSubscription.endDate)}
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowExtendModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleExtend}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? '处理中...' : '确认延期'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <AlertTriangle size={20} />
                取消订阅
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                确定要取消用户 <span className="font-medium">{selectedSubscription.userEmail}</span> 的订阅吗？
              </p>
              <p className="text-sm text-red-500 mt-2">
                此操作将立即生效，用户将被降级为 Free 计划。
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                返回
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? '处理中...' : '确认取消'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
