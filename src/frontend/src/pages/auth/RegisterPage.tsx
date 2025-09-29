import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth, useToast } from '@hooks/index';
import { cn } from '@utils/index';

// 폼 스키마
const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, '이름을 입력해주세요.')
    .min(2, '이름은 최소 2자 이상이어야 합니다.'),
  last_name: z
    .string()
    .min(1, '성을 입력해주세요.'),
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식이 아닙니다.'),
  username: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 3,
      '사용자명은 최소 3자 이상이어야 합니다.'
    ),
  phone_number: z
    .string()
    .optional(),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요.')
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
  confirm_password: z
    .string()
    .min(1, '비밀번호 확인을 입력해주세요.'),
}).refine(
  (data) => data.password === data.confirm_password,
  {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirm_password'],
  }
);

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirm_password, ...registerData } = data;
      await registerUser({
        ...registerData,
        timezone: 'Asia/Seoul',
        language: 'ko',
      });
      showSuccess('회원가입 성공', '회원가입에 성공하였습니다. 로그인 페이지로 이동합니다.');
      
      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      showError('회원가입 실패', error instanceof Error ? error.message : '회원가입에 실패했습니다.');
    }
  };

  // 비밀번호 강도 체크
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = password ? getPasswordStrength(password) : 0;
  const strengthLabels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
  const strengthColors = ['bg-error-500', 'bg-warning-500', 'bg-yellow-500', 'bg-success-500', 'bg-green-600'];

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
            회원가입
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            새 계정을 만들어 일정 관리를 시작하세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">성</label>
              <input
                {...register('last_name')}
                type="text"
                placeholder="성"
                className={cn(
                  'input',
                  errors.last_name && 'input-error'
                )}
              />
              {errors.last_name && (
                <p className="form-error">{errors.last_name.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">이름</label>
              <input
                {...register('first_name')}
                type="text"
                placeholder="이름"
                className={cn(
                  'input',
                  errors.first_name && 'input-error'
                )}
              />
              {errors.first_name && (
                <p className="form-error">{errors.first_name.message}</p>
              )}
            </div>
          </div>

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

          {/* Username (optional) */}
          <div className="form-group">
            <label className="form-label">사용자명 (선택사항)</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('username')}
                type="text"
                placeholder="사용자명"
                className={cn(
                  'input pl-10',
                  errors.username && 'input-error'
                )}
              />
            </div>
            {errors.username && (
              <p className="form-error">{errors.username.message}</p>
            )}
          </div>

          {/* Phone (optional) */}
          <div className="form-group">
            <label className="form-label">휴대폰 번호 (선택사항)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('phone_number')}
                type="tel"
                placeholder="010-1234-5678"
                className={cn(
                  'input pl-10',
                  errors.phone_number && 'input-error'
                )}
              />
            </div>
            {errors.phone_number && (
              <p className="form-error">{errors.phone_number.message}</p>
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
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
            
            {/* Password strength indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        strengthColors[passwordStrength - 1] || 'bg-gray-300'
                      )}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {strengthLabels[passwordStrength - 1] || ''}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">비밀번호 확인</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('confirm_password')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력하세요"
                className={cn(
                  'input pl-10 pr-10',
                  errors.confirm_password && 'input-error'
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="form-error">{errors.confirm_password.message}</p>
            )}
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
                회원가입 중...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <UserPlus className="w-5 h-5 mr-2" />
                회원가입
              </div>
            )}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            이미 계정이 있으신가요?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              로그인
            </Link>
          </p>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            회원가입을 진행하면{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-700">
              이용약관
            </Link>{' '}
            및{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
