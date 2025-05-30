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
}

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AuthContextType {
  user: UserLoginResponse | AdminLoginResponse | null;
  login: (credentials: LoginRequest, userType: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: UserRole | null;
}

export interface ForgotPasswordFormProps {
  userType: UserRole;
  title: string;
  description: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface OTPVerificationResponse {
  success: boolean;
  message: string;
  token?: string;
}

export interface PasswordResetVerificationRequest {
  email: string;
  otp: string;
  newPassword: string;
}