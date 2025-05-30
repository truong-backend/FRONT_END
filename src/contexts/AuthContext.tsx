import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextType, LoginRequest, UserRole, UserLoginResponse, AdminLoginResponse } from '../types/auth';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserLoginResponse | AdminLoginResponse | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const savedUser = localStorage.getItem('user');
      const savedRole = localStorage.getItem('userRole') as UserRole;
      const token = localStorage.getItem('accessToken');

      if (savedUser && savedRole && token) {
        setUser(JSON.parse(savedUser));
        setUserRole(savedRole);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest, userType: UserRole) => {
    try {
      let response: UserLoginResponse | AdminLoginResponse;
      
      switch (userType) {
        case 'STUDENT':
          response = await authAPI.loginStudent(credentials);
          break;
        case 'TEACHER':
          response = await authAPI.loginTeacher(credentials);
          break;
        case 'ADMIN':
          response = await authAPI.loginAdmin(credentials);
          break;
        default:
          throw new Error('Invalid user type');
      }

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('userRole', userType);
      
      setUser(response);
      setUserRole(userType);
    } catch (error: unknown) {
      let errorMessage = 'Đăng nhập thất bại';
      type ErrorWithResponse = { response?: { data?: string } };
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as ErrorWithResponse).response &&
        typeof (error as ErrorWithResponse).response?.data === 'string'
      ) {
        errorMessage = (error as ErrorWithResponse).response!.data!;
      }
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setUser(null);
    setUserRole(null);
  };

  const isAuthenticated = !!user;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};