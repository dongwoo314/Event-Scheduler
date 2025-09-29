// 한국 공휴일 데이터 및 유틸리티
export interface Holiday {
  date: string; // YYYY-MM-DD 형식
  name: string;
  type: 'national' | 'lunar' | 'substitute'; // 국경일, 음력기반, 대체공휴일
  isSubstitute?: boolean; // 대체공휴일 여부
}

// 2024년 한국 공휴일 (고정일자)
const FIXED_HOLIDAYS_2024: Holiday[] = [
  { date: '2024-01-01', name: '신정', type: 'national' },
  { date: '2024-03-01', name: '삼일절', type: 'national' },
  { date: '2024-05-05', name: '어린이날', type: 'national' },
  { date: '2024-06-06', name: '현충일', type: 'national' },
  { date: '2024-08-15', name: '광복절', type: 'national' },
  { date: '2024-10-03', name: '개천절', type: 'national' },
  { date: '2024-10-09', name: '한글날', type: 'national' },
  { date: '2024-12-25', name: '크리스마스', type: 'national' },
];

// 2024년 음력 기반 공휴일 (실제 날짜로 계산됨)
const LUNAR_HOLIDAYS_2024: Holiday[] = [
  { date: '2024-02-09', name: '설날연휴', type: 'lunar' },
  { date: '2024-02-10', name: '설날', type: 'lunar' },
  { date: '2024-02-11', name: '설날연휴', type: 'lunar' },
  { date: '2024-02-12', name: '설날 대체공휴일', type: 'substitute', isSubstitute: true },
  { date: '2024-04-10', name: '국회의원선거일', type: 'national' },
  { date: '2024-05-06', name: '어린이날 대체공휴일', type: 'substitute', isSubstitute: true },
  { date: '2024-05-15', name: '부처님오신날', type: 'lunar' },
  { date: '2024-09-16', name: '추석연휴', type: 'lunar' },
  { date: '2024-09-17', name: '추석', type: 'lunar' },
  { date: '2024-09-18', name: '추석연휴', type: 'lunar' },
];

// 2025년 한국 공휴일
const FIXED_HOLIDAYS_2025: Holiday[] = [
  { date: '2025-01-01', name: '신정', type: 'national' },
  { date: '2025-03-01', name: '삼일절', type: 'national' },
  { date: '2025-05-05', name: '어린이날', type: 'national' },
  { date: '2025-06-06', name: '현충일', type: 'national' },
  { date: '2025-08-15', name: '광복절', type: 'national' },
  { date: '2025-10-03', name: '개천절', type: 'national' },
  { date: '2025-10-09', name: '한글날', type: 'national' },
  { date: '2025-12-25', name: '크리스마스', type: 'national' },
];

const LUNAR_HOLIDAYS_2025: Holiday[] = [
  { date: '2025-01-28', name: '설날연휴', type: 'lunar' },
  { date: '2025-01-29', name: '설날', type: 'lunar' },
  { date: '2025-01-30', name: '설날연휴', type: 'lunar' },
  { date: '2025-05-12', name: '부처님오신날', type: 'lunar' },
  { date: '2025-10-05', name: '추석연휴', type: 'lunar' },
  { date: '2025-10-06', name: '추석', type: 'lunar' },
  { date: '2025-10-07', name: '추석연휴', type: 'lunar' },
  { date: '2025-10-08', name: '추석 대체공휴일', type: 'substitute', isSubstitute: true },
];

// 모든 공휴일 데이터
const ALL_HOLIDAYS: Record<number, Holiday[]> = {
  2024: [...FIXED_HOLIDAYS_2024, ...LUNAR_HOLIDAYS_2024],
  2025: [...FIXED_HOLIDAYS_2025, ...LUNAR_HOLIDAYS_2025],
};

/**
 * 특정 날짜가 공휴일인지 확인
 */
export const isHoliday = (date: Date): Holiday | null => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  const yearHolidays = ALL_HOLIDAYS[year] || [];
  return yearHolidays.find(holiday => holiday.date === dateString) || null;
};

/**
 * 특정 달의 모든 공휴일 조회
 */
export const getHolidaysInMonth = (year: number, month: number): Holiday[] => {
  const yearHolidays = ALL_HOLIDAYS[year] || [];
  const monthString = String(month).padStart(2, '0');
  
  return yearHolidays.filter(holiday => {
    const holidayMonth = holiday.date.split('-')[1];
    return holidayMonth === monthString;
  });
};

/**
 * 특정 날짜 범위의 공휴일 조회
 */
export const getHolidaysInRange = (startDate: Date, endDate: Date): Holiday[] => {
  const holidays: Holiday[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const holiday = isHoliday(currentDate);
    if (holiday) {
      holidays.push(holiday);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return holidays;
};

/**
 * 공휴일 타입에 따른 색상 반환
 */
export const getHolidayColor = (holiday: Holiday): string => {
  switch (holiday.type) {
    case 'national':
      return 'text-red-600 dark:text-red-400';
    case 'lunar':
      return 'text-red-500 dark:text-red-300';
    case 'substitute':
      return 'text-orange-600 dark:text-orange-400';
    default:
      return 'text-red-600 dark:text-red-400';
  }
};

/**
 * 공휴일 배경색 반환
 */
export const getHolidayBgColor = (holiday: Holiday): string => {
  switch (holiday.type) {
    case 'national':
      return 'bg-red-50 dark:bg-red-900/20';
    case 'lunar':
      return 'bg-red-50 dark:bg-red-900/20';
    case 'substitute':
      return 'bg-orange-50 dark:bg-orange-900/20';
    default:
      return 'bg-red-50 dark:bg-red-900/20';
  }
};

/**
 * 주말인지 확인
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
};

/**
 * 공휴일이나 주말인지 확인
 */
export const isNonWorkingDay = (date: Date): boolean => {
  return isWeekend(date) || isHoliday(date) !== null;
};

/**
 * 다음 영업일 찾기
 */
export const getNextWorkingDay = (date: Date): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  while (isNonWorkingDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
};

/**
 * 이전 영업일 찾기
 */
export const getPreviousWorkingDay = (date: Date): Date => {
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);
  
  while (isNonWorkingDay(prevDay)) {
    prevDay.setDate(prevDay.getDate() - 1);
  }
  
  return prevDay;
};

/**
 * 월별 영업일 수 계산
 */
export const getWorkingDaysInMonth = (year: number, month: number): number => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  let workingDays = 0;
  
  const currentDate = new Date(firstDay);
  while (currentDate <= lastDay) {
    if (!isNonWorkingDay(currentDate)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};