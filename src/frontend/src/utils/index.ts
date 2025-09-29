import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 클래스를 병합하는 유틸리티 함수
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 디바운스 함수
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 스로틀 함수
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 날짜 형식 변환 함수들
 */
export const formatDate = {
  /**
   * 기본 날짜 형식 (YYYY-MM-DD)
   */
  basic: (date: Date | string): string => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  /**
   * 한국어 날짜 형식 (2024년 12월 25일)
   */
  korean: (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * 시간 포함 형식 (2024-12-25 14:30)
   */
  datetime: (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  },

  /**
   * 상대적 시간 (3분 전, 1시간 후)
   */
  relative: (date: Date | string): string => {
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const absDiff = Math.abs(diff);

    const minutes = Math.floor(absDiff / (1000 * 60));
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

    const isPast = diff < 0;
    const suffix = isPast ? '전' : '후';

    if (days > 0) {
      return `${days}일 ${suffix}`;
    } else if (hours > 0) {
      return `${hours}시간 ${suffix}`;
    } else if (minutes > 0) {
      return `${minutes}분 ${suffix}`;
    } else {
      return '방금';
    }
  },

  /**
   * 시간만 (14:30)
   */
  time: (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  },

  /**
   * 월/일 (12/25)
   */
  monthDay: (date: Date | string): string => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  },
};

/**
 * 문자열 유틸리티 함수들
 */
export const stringUtils = {
  /**
   * 첫 글자를 대문자로 변환
   */
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * 문자열을 특정 길이로 자르기
   */
  truncate: (str: string, length: number, suffix = '...'): string => {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },

  /**
   * 카멜케이스를 케밥케이스로 변환
   */
  camelToKebab: (str: string): string => {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  },

  /**
   * 케밥케이스를 카멜케이스로 변환
   */
  kebabToCamel: (str: string): string => {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  },

  /**
   * 슬러그 생성 (URL에 사용할 수 있는 문자열)
   */
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  },

  /**
   * 이니셜 생성 (김동우 -> 김동)
   */
  getInitials: (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },
};

/**
 * 숫자 유틸리티 함수들
 */
export const numberUtils = {
  /**
   * 숫자를 한국어 형식으로 포맷 (1,000)
   */
  format: (num: number): string => {
    return num.toLocaleString('ko-KR');
  },

  /**
   * 파일 크기를 읽기 쉬운 형식으로 변환
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * 백분율 계산
   */
  percentage: (value: number, total: number): number => {
    return total === 0 ? 0 : Math.round((value / total) * 100);
  },

  /**
   * 범위 내 값으로 제한
   */
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * 랜덤 숫자 생성
   */
  random: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

/**
 * 배열 유틸리티 함수들
 */
export const arrayUtils = {
  /**
   * 배열을 특정 크기로 청크 분할
   */
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * 배열에서 중복 제거
   */
  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)];
  },

  /**
   * 배열을 섞기 (Fisher-Yates 알고리즘)
   */
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * 배열을 키별로 그룹화
   */
  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  /**
   * 배열에서 최대값을 가진 항목 찾기
   */
  maxBy: <T>(array: T[], selector: (item: T) => number): T | undefined => {
    return array.reduce((max, item) => 
      selector(item) > selector(max) ? item : max
    );
  },

  /**
   * 배열에서 최소값을 가진 항목 찾기
   */
  minBy: <T>(array: T[], selector: (item: T) => number): T | undefined => {
    return array.reduce((min, item) => 
      selector(item) < selector(min) ? item : min
    );
  },
};

/**
 * 객체 유틸리티 함수들
 */
export const objectUtils = {
  /**
   * 깊은 복사
   */
  deepClone: <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * 객체에서 null/undefined 값 제거
   */
  omitNullish: <T extends Record<string, any>>(obj: T): Partial<T> => {
    const result: Partial<T> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value != null) {
        result[key as keyof T] = value;
      }
    }
    return result;
  },

  /**
   * 특정 키들만 선택
   */
  pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  },

  /**
   * 특정 키들 제외
   */
  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  },

  /**
   * 객체가 비어있는지 확인
   */
  isEmpty: (obj: Record<string, any>): boolean => {
    return Object.keys(obj).length === 0;
  },
};

/**
 * 색상 유틸리티 함수들
 */
export const colorUtils = {
  /**
   * HEX 색상을 RGB로 변환
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  },

  /**
   * RGB를 HEX로 변환
   */
  rgbToHex: (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  /**
   * 색상 밝기 계산
   */
  getBrightness: (hex: string): number => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return 0;
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  },

  /**
   * 다크/라이트 텍스트 색상 결정
   */
  getTextColor: (backgroundColor: string): string => {
    const brightness = colorUtils.getBrightness(backgroundColor);
    return brightness > 128 ? '#000000' : '#ffffff';
  },

  /**
   * 랜덤 색상 생성
   */
  randomColor: (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  },
};

/**
 * URL 유틸리티 함수들
 */
export const urlUtils = {
  /**
   * 쿼리 파라미터를 객체로 변환
   */
  parseQuery: (search: string): Record<string, string> => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    return result;
  },

  /**
   * 객체를 쿼리 스트링으로 변환
   */
  buildQuery: (params: Record<string, any>): string => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value != null) {
        query.append(key, String(value));
      }
    }
    return query.toString();
  },

  /**
   * URL 조합
   */
  joinUrl: (...parts: string[]): string => {
    return parts
      .map((part, index) => {
        if (index === 0) return part.replace(/\/+$/, '');
        return part.replace(/^\/+/, '').replace(/\/+$/, '');
      })
      .filter(Boolean)
      .join('/');
  },

  /**
   * 절대 URL인지 확인
   */
  isAbsoluteUrl: (url: string): boolean => {
    return /^https?:\/\//.test(url);
  },
};

/**
 * 로컬 스토리지 유틸리티
 */
export const storageUtils = {
  /**
   * 로컬 스토리지에 값 저장 (JSON)
   */
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  /**
   * 로컬 스토리지에서 값 가져오기 (JSON)
   */
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * 로컬 스토리지에서 값 삭제
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },

  /**
   * 로컬 스토리지 전체 삭제
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};

/**
 * 환경 변수 유틸리티
 */
export const envUtils = {
  /**
   * 개발 환경인지 확인
   */
  isDev: (): boolean => {
    return import.meta.env.DEV;
  },

  /**
   * 프로덕션 환경인지 확인
   */
  isProd: (): boolean => {
    return import.meta.env.PROD;
  },

  /**
   * 환경 변수 가져오기
   */
  get: (key: string, defaultValue?: string): string => {
    return import.meta.env[key] ?? defaultValue ?? '';
  },
};

/**
 * 에러 처리 유틸리티
 */
export const errorUtils = {
  /**
   * 에러 메시지 추출
   */
  getMessage: (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return '알 수 없는 오류가 발생했습니다.';
  },

  /**
   * API 에러 처리
   */
  handleApiError: (error: any): string => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'API 요청 중 오류가 발생했습니다.';
  },
};

/**
 * 폼 유효성 검사 유틸리티
 */
export const validationUtils = {
  /**
   * 이메일 유효성 검사
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 전화번호 유효성 검사 (한국)
   */
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
    return phoneRegex.test(phone);
  },

  /**
   * 비밀번호 강도 검사
   */
  getPasswordStrength: (password: string): {
    score: number;
    feedback: string[];
  } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('최소 8자 이상이어야 합니다');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('소문자를 포함해야 합니다');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('대문자를 포함해야 합니다');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('숫자를 포함해야 합니다');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('특수문자를 포함해야 합니다');

    return { score, feedback };
  },

  /**
   * URL 유효성 검사
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * 성능 최적화 유틸리티
 */
export const performanceUtils = {
  /**
   * 함수 실행 시간 측정
   */
  measureTime: async <T>(
    fn: () => Promise<T> | T,
    label?: string
  ): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    if (label && envUtils.isDev()) {
      console.log(`${label} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  },

  /**
   * 메모리 사용량 확인 (개발용)
   */
  logMemoryUsage: (label?: string): void => {
    if (envUtils.isDev() && 'memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`${label || 'Memory'}: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`);
    }
  },
};

// 모든 유틸리티 함수들을 하나의 객체로 내보내기
export const utils = {
  format: formatDate,
  string: stringUtils,
  number: numberUtils,
  array: arrayUtils,
  object: objectUtils,
  color: colorUtils,
  url: urlUtils,
  storage: storageUtils,
  env: envUtils,
  error: errorUtils,
  validation: validationUtils,
  performance: performanceUtils,
};

// 공휴일 관련 함수들 내보내기
export * from './holidays';

export default utils;
