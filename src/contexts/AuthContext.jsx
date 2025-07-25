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
      // Check login attempts
      const attempts = authService.getLoginAttempts(credentials.email);
      if (attempts.count >= 5) {
        const now = new Date().getTime();
        const timeDiff = now - attempts.timestamp;
        if (timeDiff < 30 * 60 * 1000) { // 30 minutes
          const remainingTime = Math.ceil((30 * 60 * 1000 - timeDiff) / 60000);
          throw new Error(`Tài khoản đã bị khóa do đăng nhập sai quá 5 lần. Vui lòng thử lại sau ${remainingTime} phút.`);
        } else {
          // Reset attempts after 30 minutes
          authService.resetLoginAttempts(credentials.email);
        }
      }

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

      // Reset login attempts on successful login
      authService.resetLoginAttempts(credentials.email);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('userRole', userType);
      
      setUser(response);
      setUserRole(userType);
    } catch (error) {
      // Increment login attempts on failure
      if (error.message !== 'Invalid user type') {
        const attempts = authService.incrementLoginAttempts(credentials.email);
        const remainingAttempts = 5 - attempts;
        
        let errorMessage = error?.response?.data || 'Đăng nhập thất bại';
        if (remainingAttempts > 0) {
          errorMessage += `. Còn ${remainingAttempts} lần thử.`;
        }
        throw new Error(errorMessage);
      }
      throw error;
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