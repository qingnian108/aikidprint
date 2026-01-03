import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminApi } from '../services/adminApi';

interface Admin {
  email: string;
  role: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 验证现有 token
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await adminApi.verify();
        if (response.success && response.data) {
          setAdmin({ email: response.data.email, role: response.data.role });
        } else {
          localStorage.removeItem('adminToken');
        }
      } catch (error) {
        console.error('Admin auth verification failed:', error);
        localStorage.removeItem('adminToken');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await adminApi.login(email, password);
    if (response.success && response.data) {
      localStorage.setItem('adminToken', response.data.token);
      setAdmin({ email: response.data.email, role: response.data.role });
    } else {
      throw new Error(response.message || '登录失败');
    }
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      setAdmin(null);
    }
  };

  const value: AdminAuthContextType = {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;
