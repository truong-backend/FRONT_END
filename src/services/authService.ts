import { authAPI } from './api';
import type { 
  LoginRequest, 
  UserLoginResponse, 
  AdminLoginResponse, 
  ResetPasswordResponse, 
  OTPVerificationResponse, 
  UserRole, 
  PasswordResetVerificationRequest 
} from '../types/auth';

export const requestOTP = async (email: string, userType: UserRole): Promise<ResetPasswordResponse> => {
  return authAPI.requestOTP(email, userType);
};

export const verifyOTPAndResetPassword = async (data: PasswordResetVerificationRequest, userType: UserRole): Promise<ResetPasswordResponse> => {
  return authAPI.verifyOTPAndResetPassword(data, userType);
};

export const verifyOTP = async (
  email: string,
  otp: string,
  userType: UserRole
): Promise<OTPVerificationResponse> => {
  return authAPI.verifyOTP(email, otp, userType);
};

export const resetPassword = async (
  token: string,
  newPassword: string,
  userType: UserRole
): Promise<ResetPasswordResponse> => {
  return authAPI.resetPassword(token, newPassword, userType);
};