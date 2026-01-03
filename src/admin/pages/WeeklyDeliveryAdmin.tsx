import React, { useEffect, useState, useCallback } from 'react';
import { Send, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import DataTable, { Column } from '../components/DataTable';

interface DeliverySetting {
  settingsId: string;
  userId: string;
  userEmail: string;
  childName: string;
  childAge: number;
  theme: string;
  deliveryMethod: string;
  schedule: string;
  enabled: boolean;
}

interface DeliveryHistory {
  historyId: string;
  userId: string;
  userEmail: string;
  childName: string;
  deliveredAt: string;
  status: string;
  pageCount: number;
  errorMessage?: string;
}

const WeeklyDeliveryAdmin: React.FC = () => {
  const [settings, setSettings] = useState<DeliverySetting[]>([]);
  const [history, setHistory] = useState<DeliveryHistory[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [settingsPage, setSettingsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [settingsTotal, setSettingsTotal] = useState(0);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [triggerLoading, setTriggerLoading] = useState<string | null>(null);
  const pageSize = 20;

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const response = await adminApi.getDeliverySettings(settingsPage, pageSize);
      if (response.success) {
        setSettings(response.data.settings || []);
        setSettingsTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch delivery settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  }, [settingsPage]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await adminApi.getDeliveryHistory(historyPage, pageSize);
      if (response.success) {
        setHistory(response.data.history || []);
        setHistoryTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch delivery history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage]);

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettings();
    } else {
      fetchHistory();
    }
  }, [activeTab, fetchSettings, fetchHistory]);

  const handleTriggerDelivery = async (setting: DeliverySetting) => {
    setTriggerLoading(setting.settingsId);
    try {
      const response = await adminApi.triggerDelivery(setting.userId, setting.settingsId);
      if (response.success) {
        // 刷新历史记录
        fetchHistory();
        alert('推送已触发');
      }
    } catch (error) {
      console.error('Failed to trigger delivery:', error);
      alert('推送失败，请重试');
    } finally {
      setTriggerLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; class: string; label: string }> = {
      success: {
        icon: <CheckCircle size={14} />,
        class: 'bg-green-100 text-green-700',
        label: '成功',
      },
      failed: {
        icon: <XCircle size={14} />,
        class: 'bg-red-100 text-red-700',
        label: '失败',
      },
      pending: {
        icon: <Clock size={14} />,
        class: 'bg-yellow-100 text-yellow-700',
        label: '处理中',
      },
    };
    const { icon, class: className, label } = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${className}`}>
        {icon}
        {label}
      </span>
    );
  };

  const settingsColumns: Column<DeliverySetting>[] = [
    {
      key: 'userEmail',
      title: '用户邮箱',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'childName',
      title: '孩子',
      render: (_, record) => (
        <div>
          <span className="font-medium">{record.childName}</span>
          <span className="text-gray-500 text-sm ml-1">({record.childAge}岁)</span>
        </div>
      ),
    },
    {
      key: 'theme',
      title: '主题',
      width: '120px',
      render: (value) => (
        <span className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
          {value}
        </span>
      ),
    },
    {
      key: 'deliveryMethod',
      title: '推送方式',
      width: '100px',
      render: (value) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: 'schedule',
      title: '推送时间',
      width: '100px',
      render: (value) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: 'actions',
      title: '操作',
      width: '100px',
      align: 'right',
      render: (_, record) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTriggerDelivery(record);
          }}
          disabled={triggerLoading === record.settingsId}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
        >
          {triggerLoading === record.settingsId ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          立即推送
        </button>
      ),
    },
  ];

  const historyColumns: Column<DeliveryHistory>[] = [
    {
      key: 'userEmail',
      title: '用户邮箱',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'childName',
      title: '孩子',
      width: '100px',
    },
    {
      key: 'status',
      title: '状态',
      width: '100px',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'pageCount',
      title: '页数',
      width: '80px',
      align: 'center',
      render: (value) => <span className="text-gray-600">{value || '-'}</span>,
    },
    {
      key: 'deliveredAt',
      title: '推送时间',
      width: '160px',
      render: (value) => <span className="text-gray-500 text-sm">{formatDate(value)}</span>,
    },
    {
      key: 'errorMessage',
      title: '错误信息',
      render: (value) =>
        value ? (
          <div className="flex items-center gap-1 text-red-600 text-sm">
            <AlertTriangle size={14} />
            {value}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Weekly Delivery 管理</h2>
        <p className="text-gray-500 text-sm mt-1">管理每周推送设置和历史记录</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            推送设置
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            推送历史
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'settings' ? (
        <DataTable
          columns={settingsColumns}
          data={settings}
          loading={settingsLoading}
          rowKey="settingsId"
          emptyText="暂无启用的推送设置"
          pagination={{
            current: settingsPage,
            pageSize,
            total: settingsTotal,
            onChange: setSettingsPage,
          }}
        />
      ) : (
        <DataTable
          columns={historyColumns}
          data={history}
          loading={historyLoading}
          rowKey="historyId"
          emptyText="暂无推送历史"
          pagination={{
            current: historyPage,
            pageSize,
            total: historyTotal,
            onChange: setHistoryPage,
          }}
        />
      )}
    </div>
  );
};

export default WeeklyDeliveryAdmin;
