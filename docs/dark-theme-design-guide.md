# 🌙 다크 테마 UI 디자인 가이드

## 🎯 다크 테마 디자인 철학
**"눈의 피로를 줄이고 집중력을 높이는 모던하고 우아한 다크 인터페이스"**

---

## 🎨 다크 테마 색상 시스템

### 배경 색상 (Background Colors)
```css
/* 메인 배경 */
--bg-primary: #111827    /* gray-900 */
--bg-secondary: #1F2937  /* gray-800 */
--bg-tertiary: #374151   /* gray-700 */

/* 그라데이션 배경 */
--bg-gradient: linear-gradient(135deg, #111827, #1F2937)
```

### 텍스트 색상 (Text Colors)
```css
/* 텍스트 계층 */
--text-primary: #FFFFFF     /* 제목, 중요 텍스트 */
--text-secondary: #D1D5DB   /* gray-300, 일반 텍스트 */
--text-tertiary: #9CA3AF    /* gray-400, 보조 텍스트 */
--text-muted: #6B7280       /* gray-500, 비활성 텍스트 */
```

### 강조 색상 (Accent Colors)
```css
/* 기능별 색상 (어두운 변형) */
--blue-dark: #1E3A8A       /* blue-900 */
--blue-accent: #3B82F6     /* blue-500 */
--green-dark: #14532D      /* green-900 */
--green-accent: #10B981    /* green-500 */
--yellow-dark: #92400E     /* yellow-900 */
--yellow-accent: #F59E0B   /* yellow-500 */
```

### 경계선 & 구분선 (Borders)
```css
--border-primary: #374151   /* gray-700 */
--border-secondary: #4B5563 /* gray-600 */
--border-accent: #1D4ED8    /* blue-700 */
```

---

## 🎨 컴포넌트 디자인

### 1. 카드 컴포넌트 (Card Component)
```css
.dark-card {
  background: #1F2937;          /* gray-800 */
  border: 1px solid #374151;    /* gray-700 */
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.dark-card:hover {
  background: #2D3748;          /* 약간 밝게 */
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}
```

### 2. 버튼 스타일 (Button Styles)
```css
/* 기본 버튼 */
.dark-button-primary {
  background: #374151;          /* gray-700 */
  border: 1px solid #4B5563;    /* gray-600 */
  color: #D1D5DB;              /* gray-300 */
}

.dark-button-primary:hover {
  background: #4B5563;          /* gray-600 */
  transform: scale(1.05);
}

/* 성공 버튼 */
.dark-button-success {
  background: #14532D;          /* green-900 */
  border: 1px solid #166534;    /* green-800 */
  color: #BBF7D0;              /* green-200 */
}

/* 경고 버튼 */
.dark-button-warning {
  background: #92400E;          /* yellow-900 */
  border: 1px solid #B45309;    /* yellow-800 */
  color: #FEF3C7;              /* yellow-200 */
}
```

### 3. 상태 배지 (Status Badge)
```css
.dark-badge-info {
  background: #1E3A8A;          /* blue-900 */
  border: 1px solid #1D4ED8;    /* blue-700 */
  color: #BFDBFE;              /* blue-200 */
}

.dark-badge-success {
  background: #14532D;          /* green-900 */
  border: 1px solid #166534;    /* green-800 */
  color: #BBF7D0;              /* green-200 */
}
```

---

## 🌟 다크 테마 UX 원칙

### 1. 대비비 확보 (Contrast Ratio)
```css
/* WCAG AA 기준 준수 */
대제목: white on gray-800     → 대비비 15.8:1 ✅
본문: gray-300 on gray-800    → 대비비 8.1:1 ✅
보조: gray-400 on gray-800    → 대비비 5.2:1 ✅
```

### 2. 시각적 계층 (Visual Hierarchy)
```css
계층 1: 흰색 텍스트 + 굵은 폰트        /* 최고 우선순위 */
계층 2: gray-300 텍스트 + 보통 폰트    /* 일반 정보 */
계층 3: gray-400 텍스트 + 작은 폰트    /* 부가 정보 */
계층 4: gray-500 텍스트 + 얇은 폰트    /* 메타 정보 */
```

### 3. 깊이감 표현 (Depth & Elevation)
```css
레벨 1: box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);   /* 기본 */
레벨 2: box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);   /* 호버 */
레벨 3: box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);  /* 모달 */
```

---

## 🎯 다크 테마 장점

### 사용자 경험 개선
✅ **눈의 피로 감소** - 낮은 블루라이트 노출
✅ **배터리 절약** - OLED 화면에서 전력 효율성
✅ **집중력 향상** - 산만한 밝은 요소 제거
✅ **야간 사용 최적화** - 어두운 환경에서 편안함

### 디자인적 장점
✅ **모던한 느낌** - 현대적이고 세련된 인상
✅ **콘텐츠 강조** - 중요한 정보가 더 돋보임
✅ **브랜드 차별화** - 프리미엄한 느낌 연출
✅ **미니멀리즘** - 깔끔하고 정돈된 인터페이스

---

## 📱 반응형 다크 테마

### 모바일 최적화
```css
/* 모바일에서 터치 영역 강화 */
@media (max-width: 768px) {
  .dark-button {
    min-height: 48px;          /* 터치 영역 확보 */
    padding: 12px 16px;
    font-size: 16px;           /* 가독성 확보 */
  }
  
  .dark-card {
    margin: 8px;               /* 여백 확보 */
    border-radius: 12px;       /* 모바일에 적합한 둥근 모서리 */
  }
}
```

### 데스크톱 최적화
```css
@media (min-width: 1024px) {
  .dark-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px;
  }
  
  .dark-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }
}
```

---

## 🌙 라이트/다크 모드 전환

### 자동 감지
```javascript
// 시스템 테마 자동 감지
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function updateTheme(e) {
  if (e.matches) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

prefersDark.addEventListener('change', updateTheme);
updateTheme(prefersDark);
```

### 수동 전환
```javascript
// 테마 토글 기능
function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}
```

---

## 🎨 접근성 고려사항

### 색맹 사용자 배려
```css
/* 색상 외 다른 구분 요소 병행 */
.status-success {
  background: green-900;
  border-left: 4px solid green-500;  /* 시각적 구분 */
}

.status-error {
  background: red-900;
  border-left: 4px solid red-500;
  position: relative;
}

.status-error::before {
  content: "⚠️";                     /* 아이콘으로 의미 보강 */
  margin-right: 8px;
}
```

### 키보드 네비게이션
```css
/* 포커스 상태 강화 */
.dark-button:focus {
  outline: 2px solid #3B82F6;       /* blue-500 */
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}
```

---

## 🚀 구현 팁

### TailwindCSS 다크 모드 설정
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // class 기반 다크 모드
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#1F2937',
          100: '#111827',
          200: '#0F172A',
        }
      }
    }
  }
}
```

### CSS 변수 활용
```css
:root {
  --bg-primary: #FFFFFF;
  --text-primary: #000000;
}

[data-theme="dark"] {
  --bg-primary: #111827;
  --text-primary: #FFFFFF;
}

.component {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

---

## 📊 성능 고려사항

### 이미지 최적화
```css
/* 다크 모드에서 이미지 밝기 조정 */
.dark img {
  filter: brightness(0.8) contrast(1.1);
}

/* 아이콘 색상 반전 */
.dark .icon-light {
  filter: invert(1);
}
```

### 애니메이션 최적화
```css
/* 다크 모드 전환 애니메이션 */
* {
  transition: background-color 0.2s ease, 
              color 0.2s ease, 
              border-color 0.2s ease;
}
```

이런 다크 테마 디자인은 어떠신가요? 알림 시스템이 훨씬 더 모던하고 사용하기 편해 보이네요!
