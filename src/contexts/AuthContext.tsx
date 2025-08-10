import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; fullName: string; username: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          api.setToken(token);
          const response = await api.getMyProfile();
          if (response.success) {
            setUser(response.data as User);
          } else {
            // Token is invalid, clear it
            api.removeToken();
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
          api.removeToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      if (response.success) {
        const data = response.data as any;
        const { accessToken, refreshToken, user: userData } = data;
        api.setToken(accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(userData as User);
        toast({
          title: "Welcome back!",
          description: `Good to see you again, ${userData.fullName}`,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (data: { email: string; password: string; fullName: string; username: string }) => {
    try {
      const response = await api.signup(data);
      if (response.success) {
        const responseData = response.data as any;
        const { accessToken, refreshToken, user: userData } = responseData;
        api.setToken(accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(userData as User);
        toast({
          title: "Welcome to TaleTrail!",
          description: `Your account has been created successfully, ${userData.fullName}`,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An error occurred during signup",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    api.removeToken();
    setUser(null);
    toast({
      title: "Signed out",
      description: "You have been successfully signed out",
    });
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}