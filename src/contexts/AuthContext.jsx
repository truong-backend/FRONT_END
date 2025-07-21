import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const savedUser = localStorage.getItem('user');
      const savedRole = localStorage.getItem('userRole');
      const token = localStorage.getItem('accessToken');

      if (savedUser && savedRole && token) {
        setUser(JSON.parse(savedUser));
        setUserRole(savedRole);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials, userType) => {
    try {
      let response;
      
      switch (userType) {
        case 'STUDENT':
          response = await authService.loginStudent(credentials);
          break;
        case 'TEACHER':
          response = await authService.loginTeacher(credentials);
          break;
        case 'ADMIN':
          response = await authService.loginAdmin(credentials);
          break;
        default:
          throw new Error('Invalid user type');
      }

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('userRole', userType);
      
      setUser(response);
      setUserRole(userType);
    } catch (error) {
      let errorMessage = 'Đăng nhập thất bại';
      if (error?.response?.data) {
        errorMessage = error.response.data;
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