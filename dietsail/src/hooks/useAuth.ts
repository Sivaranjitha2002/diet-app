import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';
import { zcAuth } from '@zcatalyst/auth-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const isAuthenticated = await zcAuth.isUserAuthenticated();
      console.log('User authentication status:', isAuthenticated);
      if (isAuthenticated) {
        try {
          setUser(isAuthenticated);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          zcAuth.signOut('/logout.html');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  return {
    user,
    loading
  };
};

export { AuthContext };