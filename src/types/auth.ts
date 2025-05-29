export interface LoginRequest {
  email: string;
  password: string;
}
export interface UserLoginResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  role: string;
}
export interface AdminLoginResponse {
  accessToken: string;
  tokenType: string;
  adminId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface AuthContextType {
  user: UserLoginResponse | AdminLoginResponse | null;
  login: (credentials: LoginRequest, userType: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: UserRole | null;
}