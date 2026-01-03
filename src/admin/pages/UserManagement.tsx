import React, { useEffect, useState, useCallback } from 'react';
import { Search, X, ArrowUp, ArrowDown, Eye, History } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import DataTable, { Column } from '../components/DataTable';

interface User {
  userId: string;
  email: string;
  displayName: string;
  plan: 'Free' | 'Pro';
  createdAt: string;
}

interface UserDetail extends User {
  subscription?: {
    status: string;
    startDate: string;
    endDate: string;
  };
  children?: Array<{
    name: string;
    age: number;
  }>;
}

interface UsageRecord {
  date: string;
  count: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [usageData, setUsageData] = useState<UsageRecord[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers(page, pageSize, search || undefined);
      if (response.success) {
        // 后端返回 items，兼容 users
        setUsers(response.data.items || response.data.users || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleViewDetail = async (user: User) => {
    try {
      const response = await adminApi.getUserDetail(user.userId);
      if (response.success) {
        setSelectedUser(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
    }
  };

  const handleViewUsage = async (user: User) => {
    try {
      const response = await adminApi.getUserUsage(user.userId, 30);
      if (response.success) {
        setUsageData(response.data || []);
        setSelectedUser(user as UserDetail);
        setShowUsageModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch user usage:', error);
    }
  };

  const handleUpdatePlan = async (userId: string, newPlan: 'Free' | 'Pro') => {
    setActionLoading(true);
    try {
      const response = await adminApi.updateUserPlan(userId, newPlan);
      if (response.success) {
        // 刷新用户列表
        fetchUsers();
        // 如果详情弹窗打开，也更新详情
        if (selectedUser && selectedUser.userId === userId) {
          setSelectedUser({ ...selectedUser, plan: newPlan });
        }
      }
    } catch (error) {
      console.error('Failed to update user plan:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const columns: Column<User>[] = [
    {
      key: 'email',
      title: '邮箱',
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.email}</div>
          {record.displayName && (
            <div className="text-xs text-gray-500">{record.displayName}</div>
          )}
        </div>
      ),
    },
    {
      key: 'plan',
      title: '计划',
      width: '100px',
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            value === 'Pro'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: '注册时间',
      width: '120px',
      render: (value) => <span className="text-gray-500">{formatDate(value)}</span>,
    },
    {
      key: 'actions',
      title: '操作',
      width: '200px',
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail(record);
            }}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="查看详情"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewUsage(record);
            }}
            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
            title="使用历史"
          >
            <History size={16} />
          </button>
          {record.plan === 'Free' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdatePlan(record.userId, 'Pro');
              }}
              disabled={actionLoading}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
            >
              <ArrowUp size={14} />
              升级
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdatePlan(record.userId, 'Free');
              }}
              disabled={actionLoading}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 rounded disabled:opacity-50"
            >
              <ArrowDown size={14} />
              降级
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">用户管理</h2>
        <p className="text-gray-500 text-sm mt-1">查看和管理所有用户账户</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索邮箱..."
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
        data={users}
        loading={loading}
        rowKey="userId"
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: setPage,
        }}
      />

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">用户详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-500">邮箱</label>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">显示名称</label>
                <p className="font-medium">{selectedUser.displayName || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">计划</label>
                <p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedUser.plan === 'Pro'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {selectedUser.plan}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">注册时间</label>
                <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
              </div>
              {selectedUser.subscription && (
                <div>
                  <label className="text-sm text-gray-500">订阅信息</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                    <p>状态: {selectedUser.subscription.status}</p>
                    <p>开始: {formatDate(selectedUser.subscription.startDate)}</p>
                    <p>结束: {formatDate(selectedUser.subscription.endDate)}</p>
                  </div>
                </div>
              )}
              {selectedUser.children && selectedUser.children.length > 0 && (
                <div>
                  <label className="text-sm text-gray-500">孩子档案</label>
                  <div className="mt-1 space-y-2">
                    {selectedUser.children.map((child, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm">
                        {child.name} ({child.age}岁)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Usage History Modal */}
      {showUsageModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">使用历史 - {selectedUser.email}</h3>
              <button
                onClick={() => setShowUsageModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {usageData.length === 0 ? (
                <p className="text-center text-gray-400 py-8">暂无使用记录</p>
              ) : (
                <div className="space-y-2">
                  {usageData.map((record, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-600">{formatDate(record.date)}</span>
                      <span className="font-medium">{record.count} 次生成</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
