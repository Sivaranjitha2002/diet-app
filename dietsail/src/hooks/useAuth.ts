import { useState, useEffect, createContext, useContext } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';
import { zcAuth } from '@zcatalyst/auth-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: any) => Promise<void>;
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
      if (await zcAuth.isUserAuthenticated()) {
        try {
          const userData = await zcAuth.getProjectUserDetails();
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          zcAuth.signOut('/logout.html');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      await zcAuth.hostedSignIn();
      setUser(await zcAuth.getProjectUserDetails());
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      await zcAuth.signUp(userData);
      setUser(await zcAuth.getProjectUserDetails());
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const updateProfile = async (updates: any) => {
    try {
      const response = await apiService.updateUserProfile(updates);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile
  };
};

export { AuthContext };