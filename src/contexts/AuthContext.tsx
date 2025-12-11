import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithGoogle, signInWithEmail, signUpWithEmail, logoutUser } from '../services/firebase';
import { createOrUpdateUser, getUserData } from '../services/firestoreService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  googleSignIn: () => Promise<void>;
  emailSignIn: (email: string, password: string) => Promise<void>;
  emailSignUp: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // 用户登录时，创建或更新 Firestore 记录
        try {
          await createOrUpdateUser(user.uid, user.email || '', user.displayName || undefined);
          
          // 从 Firestore 获取用户计划
          const userData = await getUserData(user.uid);
          if (userData) {
            // 同步到 localStorage（用于快速访问）
            localStorage.setItem(`userPlan:${user.uid}`, userData.plan);
          }
        } catch (error) {
          console.error('同步用户数据失败:', error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const googleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in failed:", error);
      throw error;
    }
  };

  const emailSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      console.error("Email sign-in failed:", error);
      throw error;
    }
  };

  const emailSignUp = async (email: string, password: string) => {
    try {
      await signUpWithEmail(email, password);
    } catch (error) {
      console.error("Email sign-up failed:", error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    googleSignIn,
    emailSignIn,
    emailSignUp,
    logOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
