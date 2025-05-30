import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ForgotPasswordFormProps } from '../../types/auth';
import { requestOTP } from '../../services/authService';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ userType, title, description }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await requestOTP(email, userType);
      // Store email in sessionStorage for the next steps
      sessionStorage.setItem('resetEmail', email);
      navigate(`/${userType.toLowerCase()}/verify-otp`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="backdrop-blur-xl bg-white/10 shadow-2xl rounded-2xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Send className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto animate-ping opacity-20"></div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              {title}
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm animate-slideInDown">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-400 transition-all duration-200 hover:bg-white/10"
                  placeholder="Nhập địa chỉ email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-purple-500/10 group-focus-within:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Gửi mã xác nhận</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate(`/${userType.toLowerCase()}/login`)}
                className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại đăng nhập
              </button>
            </div>
          </form>

          {/* Decorative elements */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-200"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse animation-delay-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 