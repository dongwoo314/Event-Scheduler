import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth, useToast } from '@hooks/index';
import { cn } from '@utils/index';

// 폼 스키마
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식이 아닙니다.'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요.')
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      showSuccess('로그인 성공', '환영합니다!');
      navigate('/dashboard');
    } catch (error) {
      showError('로그인 실패', error instanceof Error ? error.message : '로그인에 실패했습니다.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 shadow-medium rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            로그인
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            계정에 로그인하여 일정을 관리하세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div className="form-group">
            <label className="form-label">이메일</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('email')}
                type="email"
                placeholder="이메일을 입력하세요"
                className={cn(
                  'input pl-10',
                  errors.email && 'input-error'
                )}
              />
            </div>
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                className={cn(
                  'input pl-10 pr-10',
                  errors.password && 'input-error'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={cn(
              'w-full btn btn-primary btn-lg',
              (isSubmitting || isLoading) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSubmitting || isLoading ? (
              <div className="flex items-center justify-center">
                <div className="spinner w-5 h-5 mr-2"></div>
                로그인 중...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="w-5 h-5 mr-2" />
                로그인
              </div>
            )}
          </button>
        </form>

        {/* Sign up link */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            계정이 없으신가요?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              회원가입
            </Link>
          </p>
        </div>

        {/* Demo account info */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            <strong>데모 계정:</strong> demo@snu.ac.kr / password123
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
