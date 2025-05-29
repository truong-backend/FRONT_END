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

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedRole = localStorage.getItem('userRole') as UserRole;
    if (savedUser && savedRole) {
      setUser(JSON.parse(savedUser));
      setUserRole(savedRole);
    }
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
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        errorMessage = (error as { response: { data: string } }).response.data;
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};