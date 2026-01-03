import React, { useEffect, useState, useCallback } from 'react';
import { Filter, X, Eye, ExternalLink } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import DataTable, { Column } from '../components/DataTable';

interface Payment {
  paymentId: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  paypalOrderId: string;
  status: string;
  createdAt: string;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // Modal state
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getPayments(page, pageSize, statusFilter || undefined);
      if (response.success) {
        // 后端返回 items，兼容 payments
        setPayments(response.data.items || response.data.payments || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      completed: '已完成',
      pending: '处理中',
      failed: '失败',
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const columns: Column<Payment>[] = [
    {
      key: 'userEmail',
      title: '用户邮箱',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'amount',
      title: '金额',
      width: '120px',
      render: (value, record) => (
        <span className="font-medium text-gray-900">
          {formatAmount(value, record.currency)}
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
      key: 'paypalOrderId',
      title: 'PayPal 订单号',
      width: '180px',
      render: (value) => (
        <span className="text-gray-500 font-mono text-xs">
          {value ? value.substring(0, 16) + '...' : '-'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: '支付时间',
      width: '160px',
      render: (value) => <span className="text-gray-500 text-sm">{formatDate(value)}</span>,
    },
    {
      key: 'actions',
      title: '操作',
      width: '80px',
      align: 'right',
      render: (_, record) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPayment(record);
            setShowDetailModal(true);
          }}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
          title="查看详情"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'completed', label: '已完成' },
    { value: 'pending', label: '处理中' },
    { value: 'failed', label: '失败' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">支付记录</h2>
        <p className="text-gray-500 text-sm mt-1">查看所有支付交易记录</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <span className="text-sm text-gray-600">状态筛选:</span>
        </div>
        <div className="flex gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                statusFilter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        rowKey="paymentId"
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: setPage,
        }}
      />

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">支付详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">支付 ID</label>
                  <p className="font-mono text-sm">{selectedPayment.paymentId}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">状态</label>
                  <p>{getStatusBadge(selectedPayment.status)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">用户邮箱</label>
                <p className="font-medium">{selectedPayment.userEmail}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">金额</label>
                  <p className="text-xl font-bold text-green-600">
                    {formatAmount(selectedPayment.amount, selectedPayment.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">货币</label>
                  <p className="font-medium">{selectedPayment.currency}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">PayPal 订单号</label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm">{selectedPayment.paypalOrderId || '-'}</p>
                  {selectedPayment.paypalOrderId && (
                    <a
                      href={`https://www.paypal.com/activity/payment/${selectedPayment.paypalOrderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">支付时间</label>
                <p className="font-medium">{formatDate(selectedPayment.createdAt)}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
