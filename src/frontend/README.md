# Event Scheduler Frontend

React + TypeScript + Vite 기반의 현대적인 웹 프론트엔드

## 🚀 기술 스택

### 핵심 기술
- **React 18** - 사용자 인터페이스
- **TypeScript** - 타입 안전성
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS** - 유틸리티 기반 스타일링

### 상태 관리
- **Zustand** - 경량 상태 관리
- **React Query** - 서버 상태 관리

### UI/UX
- **Framer Motion** - 애니메이션
- **Lucide React** - 아이콘
- **React Hot Toast** - 알림
- **React Hook Form** - 폼 관리

### 유틸리티
- **date-fns** - 날짜 처리
- **axios** - HTTP 클라이언트
- **zod** - 스키마 검증

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   └── ui/             # UI 컴포넌트
├── pages/              # 페이지 컴포넌트
│   ├── auth/           # 인증 관련 페이지
│   └── [page].tsx      # 각 페이지
├── hooks/              # 커스텀 훅
├── services/           # API 서비스
├── store/              # 상태 관리 (Zustand)
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
├── assets/             # 정적 자원
├── App.tsx             # 메인 앱 컴포넌트
└── main.tsx            # 엔트리 포인트
```

## 🛠️ 개발 환경 설정

### 1. 의존성 설치
```bash
# Windows
setup-frontend.bat

# Linux/Mac  
chmod +x setup-frontend.sh
./setup-frontend.sh
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
```

필수 환경 변수:
- `VITE_API_BASE_URL`: 백엔드 API URL
- `VITE_WS_URL`: WebSocket URL
- Firebase 설정 (알림용)

### 3. 개발 서버 실행
```bash
npm run dev
```

## 📦 주요 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 타입 체크
npm run type-check

# 린트 검사
npm run lint
npm run lint:fix

# 테스트 실행
npm run test
npm run test:ui
```

## 🎨 주요 기능

### ✅ 완료된 기능
- 🔐 **인증 시스템** - JWT 기반 로그인/회원가입
- 📊 **대시보드** - 통계 및 빠른 접근
- 🎨 **다크 모드** - 시스템/수동 테마 전환
- 📱 **반응형 디자인** - 모바일/태블릿/데스크톱
- 🚀 **애니메이션** - Framer Motion 기반

### 🚧 개발 중인 기능
- 📅 **캘린더 뷰** - 월/주/일 보기
- 📝 **이벤트 관리** - CRUD 및 필터링
- 👥 **그룹 관리** - 협업 기능
- 🔔 **실시간 알림** - WebSocket 기반
- 📊 **통계 및 분석** - 차트 및 리포트

## 🎯 컴포넌트 사용법

### 기본 스타일 클래스
```tsx
// 버튼
<button className="btn btn-primary">기본 버튼</button>
<button className="btn btn-secondary btn-sm">작은 버튼</button>

// 입력 필드
<input className="input" placeholder="입력하세요" />
<input className="input input-error" /> // 에러 상태

// 카드
<div className="card p-6">카드 내용</div>

// 배지
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
```

### 상태 관리
```tsx
import { useAuthStore, useUiStore, useEventsStore } from '@store';

function MyComponent() {
  const { user, login } = useAuthStore();
  const { showToast } = useUiStore();
  const { events, fetchEvents } = useEventsStore();
}
```

### 커스텀 훅
```tsx
import { useApi, useDebounce, useAuth, useToast } from '@hooks';

function MyComponent() {
  const { data, loading, execute } = useApi();
  const debouncedValue = useDebounce(searchTerm, 300);
  const { showSuccess } = useToast();
}
```

## 🔧 개발 가이드

### 새 페이지 추가
1. `src/pages/` 에 페이지 컴포넌트 생성
2. `App.tsx`에 라우트 추가
3. 필요시 사이드바 네비게이션 업데이트

### 새 API 서비스 추가
1. `src/services/` 에 서비스 클래스 생성
2. `src/types/` 에 관련 타입 정의
3. 커스텀 훅으로 래핑 (선택사항)

### 새 상태 스토어 추가
1. `src/store/` 에 Zustand 스토어 생성
2. `src/types/store.ts`에 타입 정의
3. 필요한 액션과 셀렉터 구현

## 🎨 디자인 시스템

### 색상
- **Primary**: Blue (기본 작업)
- **Success**: Green (성공 상태)
- **Warning**: Yellow (주의)
- **Error**: Red (오류)
- **Gray**: 중성 색상

### 타이포그래피
- **Font**: Inter (시스템 폰트 fallback)
- **Sizes**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl

### 간격
- **Spacing**: 4px 단위 (1, 2, 3, 4, 5, 6, 8, 10, 12, 16...)
- **Border Radius**: sm(4px), md(6px), lg(8px), xl(12px), 2xl(16px)

## 🔍 디버깅

### 개발 도구
- React DevTools
- Redux DevTools (Zustand 지원)
- Network 탭에서 API 호출 확인

### 로깅
```tsx
// 개발 모드에서만 로그 출력
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

## 📱 반응형 디자인

### 브레이크포인트
- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: >= 1024px
- **Large**: >= 1280px

### 사용법
```tsx
import { useBreakpoint } from '@hooks';

function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  
  return (
    <div className={`
      ${isMobile ? 'flex-col' : 'flex-row'}
      ${isDesktop ? 'grid-cols-3' : 'grid-cols-1'}
    `}>
      {/* 컨텐츠 */}
    </div>
  );
}
```

## 🚀 성능 최적화

### 코드 스플리팅
- 페이지별 lazy loading 적용
- 청크 분리로 번들 크기 최적화

### 이미지 최적화
- WebP 형식 사용 권장
- 적절한 크기로 리사이징
- lazy loading 적용

### 메모이제이션
```tsx
import { memo, useMemo, useCallback } from 'react';

const MyComponent = memo(({ data }) => {
  const expensiveValue = useMemo(() => {
    return heavyCalculation(data);
  }, [data]);
  
  const handleClick = useCallback(() => {
    // 클릭 핸들러
  }, []);
  
  return <div>컴포넌트 내용</div>;
});
```

## 🧪 테스트

### 테스트 실행
```bash
npm run test        # 테스트 실행
npm run test:ui     # UI에서 테스트 실행
```

### 테스트 작성 예시
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## 🔄 상태 관리 패턴

### Zustand 스토어 예시
```tsx
import { create } from 'zustand';

interface MyStore {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

## 📋 개발 체크리스트

### 새 기능 개발 시
- [ ] TypeScript 타입 정의
- [ ] 컴포넌트 props 타입 지정
- [ ] 에러 핸들링 구현
- [ ] 로딩 상태 처리
- [ ] 반응형 디자인 적용
- [ ] 접근성 고려 (aria-label 등)
- [ ] 테스트 작성

### 코드 품질
- [ ] ESLint 규칙 준수
- [ ] TypeScript strict 모드
- [ ] 컴포넌트 단일 책임 원칙
- [ ] 적절한 추상화 수준
- [ ] 성능 최적화

## 🤝 백엔드 연동

### API 호출 예시
```tsx
import { eventService } from '@services';

const MyComponent = () => {
  const { data, loading, execute } = useApi();
  
  const loadEvents = async () => {
    await execute(() => eventService.getEvents());
  };
  
  useEffect(() => {
    loadEvents();
  }, []);
};
```

### WebSocket 연결
```tsx
import { useWebSocket } from '@hooks';

const MyComponent = () => {
  const { isConnected, sendMessage } = useWebSocket('/events');
  
  useEffect(() => {
    if (isConnected) {
      sendMessage({ type: 'subscribe', data: { userId } });
    }
  }, [isConnected]);
};
```

## 📚 추가 자료

- [React 공식 문서](https://react.dev)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Framer Motion 가이드](https://www.framer.com/motion/)
- [Zustand 문서](https://github.com/pmndrs/zustand)

---
**개발자**: 김동우 (서울대학교 컴퓨터공학과)  
**AI 협업**: Claude (Anthropic)  
**프로젝트**: 졸업작품 - Event Scheduler
