import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Settings,
  Download,
  Calendar,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: '仪表盘', path: '/admin', icon: <LayoutDashboard size={20} /> },
  { name: '用户管理', path: '/admin/users', icon: <Users size={20} /> },
  { name: '订阅管理', path: '/admin/subscriptions', icon: <CreditCard size={20} /> },
  { name: '支付记录', path: '/admin/payments', icon: <FileText size={20} /> },
  { name: '内容统计', path: '/admin/content', icon: <BarChart3 size={20} /> },
  { name: 'Weekly Delivery', path: '/admin/delivery', icon: <Calendar size={20} /> },
  { name: '系统配置', path: '/admin/config', icon: <Settings size={20} /> },
  { name: '数据导出', path: '/admin/export', icon: <Download size={20} /> },
];

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <LayoutDashboard size={20} />
            </div>
            <span className="font-bold text-lg">Admin Panel</span>
          </Link>
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
              {isActive(item.path) && <ChevronRight size={16} className="ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {admin?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {admin?.email}
              </p>
              <p className="text-xs text-gray-500">管理员</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-30">
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {navItems.find((item) => isActive(item.path))?.name || '管理后台'}
          </h1>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
