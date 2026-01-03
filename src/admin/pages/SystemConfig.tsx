import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

interface SystemConfigData {
  freeDailyLimit: number;
  proMonthlyPrice: number;
  cronEnabled: boolean;
  cronExpression: string;
  timezone: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface AdminLog {
  logId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  createdAt: string;
}

const SystemConfig: React.FC = () => {
  const [config, setConfig] = useState<SystemConfigData>({
    freeDailyLimit: 3,
    proMonthlyPrice: 4.99,
    cronEnabled: true,
    cronExpression: '0 8 * * 1',
    timezone: 'Asia/Shanghai',
  });
  const [originalConfig, setOriginalConfig] = useState<SystemConfigData | null>(null);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config');
  const [logsPage, setLogsPage] = useState(1);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs' && logs.length === 0) {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getConfig();
      setConfig(data.config);
      setOriginalConfig(data.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载配置失败');
    } finally {
      setLoading(false);
    }
  };


  const fetchLogs = async (page: number = 1) => {
    try {
      setLogsLoading(true);
      const data = await adminApi.getLogs(page, 20);
      if (page === 1) {
        setLogs(data.logs);
      } else {
        setLogs(prev => [...prev, ...data.logs]);
      }
      setHasMoreLogs(data.logs.length === 20);
      setLogsPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载日志失败');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleConfigChange = (field: keyof SystemConfigData, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const hasChanges = () => {
    if (!originalConfig) return false;
    return JSON.stringify(config) !== JSON.stringify(originalConfig);
  };

  const handleSave = () => {
    if (!hasChanges()) return;
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    try {
      setSaving(true);
      setShowConfirm(false);
      await adminApi.updateConfig(config);
      setOriginalConfig(config);
      setSuccess('配置已保存');
      // Refresh logs to show the update action
      if (activeTab === 'logs') {
        fetchLogs(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存配置失败');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'config_update': '更新配置',
      'user_upgrade': '升级用户',
      'user_downgrade': '降级用户',
      'subscription_extend': '延期订阅',
      'subscription_cancel': '取消订阅',
      'delivery_trigger': '触发推送',
      'login': '管理员登录',
      'logout': '管理员登出',
    };
    return labels[action] || action;
  };

  const getTargetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'config': '系统配置',
      'user': '用户',
      'subscription': '订阅',
      'delivery': '推送',
      'auth': '认证',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">系统配置</h2>
        <p className="text-gray-500 text-sm mt-1">配置系统参数和查看管理日志</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'config'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            系统配置
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            操作日志
          </button>
        </nav>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Config Tab */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Free Daily Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                免费用户每日生成限制
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={config.freeDailyLimit}
                onChange={(e) => handleConfigChange('freeDailyLimit', parseInt(e.target.value) || 0)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-gray-500 text-xs mt-1">免费用户每天可生成的工作表数量</p>
            </div>

            {/* Pro Monthly Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pro 订阅月费 (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.proMonthlyPrice}
                onChange={(e) => handleConfigChange('proMonthlyPrice', parseFloat(e.target.value) || 0)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-gray-500 text-xs mt-1">新订阅将使用此价格</p>
            </div>

            {/* Cron Enabled */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={config.cronEnabled}
                  onChange={(e) => handleConfigChange('cronEnabled', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">启用定时任务</span>
              </label>
              <p className="text-gray-500 text-xs mt-1 ml-7">控制 Weekly Delivery 等定时任务的执行</p>
            </div>

            {/* Cron Expression */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cron 表达式
              </label>
              <input
                type="text"
                value={config.cronExpression}
                onChange={(e) => handleConfigChange('cronExpression', e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                placeholder="0 8 * * 1"
              />
              <p className="text-gray-500 text-xs mt-1">Weekly Delivery 执行时间 (默认: 每周一早8点)</p>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                时区
              </label>
              <select
                value={config.timezone}
                onChange={(e) => handleConfigChange('timezone', e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Asia/Shanghai">Asia/Shanghai (中国标准时间)</option>
                <option value="America/New_York">America/New_York (美东时间)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (美西时间)</option>
                <option value="Europe/London">Europe/London (伦敦时间)</option>
                <option value="UTC">UTC</option>
              </select>
              <p className="text-gray-500 text-xs mt-1">定时任务使用的时区</p>
            </div>

            {/* Last Updated Info */}
            {originalConfig?.updatedAt && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-500 text-sm">
                  上次更新: {formatDate(originalConfig.updatedAt)}
                  {originalConfig.updatedBy && ` 由 ${originalConfig.updatedBy}`}
                </p>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={!hasChanges() || saving}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  hasChanges() && !saving
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saving ? '保存中...' : '保存配置'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-gray-200">
          {logsLoading && logs.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无操作日志
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        管理员
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        目标类型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        目标ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        详情
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.logId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.adminEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {getActionLabel(log.action)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getTargetTypeLabel(log.targetType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {log.targetId || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hasMoreLogs && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => fetchLogs(logsPage + 1)}
                    disabled={logsLoading}
                    className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {logsLoading ? '加载中...' : '加载更多'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">确认保存配置</h3>
            <p className="text-gray-600 mb-4">
              您确定要保存这些配置更改吗？更改将立即生效。
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p className="font-medium text-gray-700 mb-2">更改内容:</p>
              <ul className="space-y-1 text-gray-600">
                {originalConfig && config.freeDailyLimit !== originalConfig.freeDailyLimit && (
                  <li>• 免费每日限制: {originalConfig.freeDailyLimit} → {config.freeDailyLimit}</li>
                )}
                {originalConfig && config.proMonthlyPrice !== originalConfig.proMonthlyPrice && (
                  <li>• Pro 月费: ${originalConfig.proMonthlyPrice} → ${config.proMonthlyPrice}</li>
                )}
                {originalConfig && config.cronEnabled !== originalConfig.cronEnabled && (
                  <li>• 定时任务: {originalConfig.cronEnabled ? '启用' : '禁用'} → {config.cronEnabled ? '启用' : '禁用'}</li>
                )}
                {originalConfig && config.cronExpression !== originalConfig.cronExpression && (
                  <li>• Cron 表达式: {originalConfig.cronExpression} → {config.cronExpression}</li>
                )}
                {originalConfig && config.timezone !== originalConfig.timezone && (
                  <li>• 时区: {originalConfig.timezone} → {config.timezone}</li>
                )}
              </ul>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={confirmSave}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                确认保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemConfig;
