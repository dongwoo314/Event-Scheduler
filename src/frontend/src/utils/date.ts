import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { zonedTimeToUtc, utcToZonedTime, format as formatTz } from 'date-fns-tz';

/**
 * 날짜를 한국어로 포맷팅
 */
export const formatDate = (
  date: Date | string,
  formatString: string = 'yyyy년 MM월 dd일',
  timezone: string = 'Asia/Seoul'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = utcToZonedTime(dateObj, timezone);
  
  return format(zonedDate, formatString, { locale: ko });
};

/**
 * 시간을 한국어로 포맷팅
 */
export const formatTime = (
  date: Date | string,
  formatString: string = 'HH:mm',
  timezone: string = 'Asia/Seoul'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = utcToZonedTime(dateObj, timezone);
  
  return format(zonedDate, formatString, { locale: ko });
};

/**
 * 날짜와 시간을 함께 포맷팅
 */
export const formatDateTime = (
  date: Date | string,
  formatString: string = 'yyyy년 MM월 dd일 HH:mm',
  timezone: string = 'Asia/Seoul'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = utcToZonedTime(dateObj, timezone);
  
  return format(zonedDate, formatString, { locale: ko });
};

/**
 * 상대적 시간 표시 (예: 3시간 전, 내일)
 */
export const formatRelativeTime = (
  date: Date | string,
  timezone: string = 'Asia/Seoul'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = utcToZonedTime(dateObj, timezone);
  
  if (isToday(zonedDate)) {
    return '오늘';
  } else if (isTomorrow(zonedDate)) {
    return '내일';
  } else if (isYesterday(zonedDate)) {
    return '어제';
  } else {
    return formatDistanceToNow(zonedDate, { 
      addSuffix: true, 
      locale: ko 
    });
  }
};

/**
 * 스마트 날짜 포맷팅
 */
export const formatSmartDate = (
  date: Date | string,
  timezone: string = 'Asia/Seoul'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = utcToZonedTime(dateObj, timezone);
  
  if (isToday(zonedDate)) {
    return `오늘 ${formatTime(date, 'HH:mm', timezone)}`;
  } else if (isTomorrow(zonedDate)) {
    return `내일 ${formatTime(date, 'HH:mm', timezone)}`;
  } else if (isYesterday(zonedDate)) {
    return `어제 ${formatTime(date, 'HH:mm', timezone)}`;
  } else {
    const daysDiff = Math.abs(
      Math.floor((zonedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    );
    
    if (daysDiff <= 7) {
      return format(zonedDate, 'eeee HH:mm', { locale: ko });
    } else {
      return formatDateTime(date, 'MM월 dd일 HH:mm', timezone);
    }
  }
};

/**
 * 이벤트 지속 시간 계산
 */
export const getEventDuration = (
  startTime: Date | string,
  endTime: Date | string
): string => {
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  
  if (durationMinutes < 60) {
    return `${durationMinutes}분`;
  } else if (durationMinutes < 24 * 60) {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
  } else {
    const days = Math.floor(durationMinutes / (24 * 60));
    const hours = Math.floor((durationMinutes % (24 * 60)) / 60);
    return hours > 0 ? `${days}일 ${hours}시간` : `${days}일`;
  }
};

// 타임존 관련 유틸리티
export const COMMON_TIMEZONES = [
  { value: 'Asia/Seoul', label: '서울 (KST)' },
  { value: 'America/New_York', label: '뉴욕 (EST/EDT)' },
  { value: 'America/Los_Angeles', label: '로스앤젤레스 (PST/PDT)' },
  { value: 'Europe/London', label: '런던 (GMT/BST)' },
  { value: 'Europe/Paris', label: '파리 (CET/CEST)' },
  { value: 'Asia/Tokyo', label: '도쿄 (JST)' },
  { value: 'Asia/Shanghai', label: '상하이 (CST)' },
  { value: 'Australia/Sydney', label: '시드니 (AEST/AEDT)' },
  { value: 'UTC', label: 'UTC' },
];

export const getBrowserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul';
};

// 색상 유틸리티
export const getPriorityColor = (priority: string): string => {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#ef4444',
  };
  
  return colors[priority as keyof typeof colors] || colors.medium;
};

export const getCategoryColor = (category: string): string => {
  const colors = {
    work: '#3b82f6',
    personal: '#8b5cf6',
    health: '#10b981',
    education: '#f59e0b',
    travel: '#06b6d4',
    family: '#ec4899',
    other: '#6b7280',
  };
  
  return colors[category as keyof typeof colors] || colors.other;
};

// 날짜 형식 상수
export const DATE_FORMATS = {
  SHORT_DATE: 'MM/dd',
  LONG_DATE: 'yyyy년 MM월 dd일',
  SHORT_TIME: 'HH:mm',
  LONG_TIME: 'HH:mm:ss',
  SHORT_DATETIME: 'MM/dd HH:mm',
  LONG_DATETIME: 'yyyy년 MM월 dd일 HH:mm',
  ISO_DATE: 'yyyy-MM-dd',
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss",
  CALENDAR_HEADER: 'yyyy년 MM월',
  WEEK_DAY: 'eeee',
  MONTH_DAY: 'MM월 dd일',
} as const;
