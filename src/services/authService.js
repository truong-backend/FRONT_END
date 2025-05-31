import { authAPI } from './api';

export const requestOTP = async (email, userType) => {
  return authAPI.requestOTP(email, userType);
};

export const verifyOTPAndResetPassword = async (data, userType) => {
  return authAPI.verifyOTPAndResetPassword(data, userType);
};

export const verifyOTP = async (email, otp, userType) => {
  return authAPI.verifyOTP(email, otp, userType);
};

export const resetPassword = async (token, newPassword, userType) => {
  return authAPI.resetPassword(token, newPassword, userType);
}; 