import { authService } from './api.js';

export const requestOTP = async (email, userType) => {
  return authService.requestOTP(email, userType);
};

export const verifyOTPAndResetPassword = async (data, userType) => {
  return authService.verifyOTPAndResetPassword(data, userType);
};

export const verifyOTP = async (email, otp, userType) => {
  return authService.verifyOTP(email, otp, userType);
};

export const resetPassword = async (token, newPassword, userType) => {
  return authService.resetPassword(token, newPassword, userType);
}; 