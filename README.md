# Event Scheduler - 졸업작품 스케줄 관리 시스템

## 🎯 프로젝트 개요
웹과 모바일 앱이 연동되는 현대적인 스케줄 프로그램 개발 프로젝트입니다.

## 👨‍💻 개발 정보
- **개발자**: 인제대학교 의료IT학과 - 김동우
- **AI 협업**: Claude (Anthropic)
- **프로젝트 유형**: 졸업작품
- **개발 기간**: 2024년

## 🏗️ 아키텍처

### 📦 백엔드 (Node.js)
```
src/backend/
├── config/          # 데이터베이스 설정
├── controllers/     # API 컨트롤러 (1개)
├── middleware/      # 미들웨어 (4개)
├── models/          # 데이터 모델 (7개)
├── routes/          # API 라우트 (5개)
├── services/        # 비즈니스 로직 (4개)
└── server.js        # 메인 서버
```

### 🎨 프론트엔드 (React)
```
src/frontend/
├── components/      # 재사용 컴포넌트
│   ├── common/     # 공통 컴포넌트
│   ├── layout/     # 레이아웃
│   └── ui/         # UI 컴포넌트
├── pages/          # 페이지 컴포넌트
├── hooks/          # 커스텀 훅
├── services/       # API 서비스
├── store/          # 상태 관리
├── types/          # TypeScript 타입
└── utils/          # 유틸리티
```

## 🚀 기술 스택

### 백엔드
- **런타임**: Node.js 16+
- **프레임워크**: Express.js
- **데이터베이스**: PostgreSQL/MySQL
- **ORM**: Sequelize
- **인증**: JWT + bcrypt
- **알림**: Firebase + Nodemailer
- **실시간**: Socket.io + WebSocket
- **검증**: Joi
- **보안**: Helmet + CORS + Rate Limiting

### 프론트엔드
- **UI 라이브러리**: React 18
- **언어**: TypeScript
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand + React Query
- **애니메이션**: Framer Motion
- **폼 관리**: React Hook Form + Zod
- **아이콘**: Lucide React
- **날짜 처리**: date-fns
- **HTTP 클라이언트**: Axios

### 데이터베이스 모델
- **User**: 사용자 정보 및 인증
- **UserPreference**: 사용자 설정
- **Event**: 이벤트/일정 데이터
- **EventParticipant**: 이벤트 참가자
- **Group**: 그룹 정보
- **GroupMember**: 그룹 멤버십
- **Notification**: 알림 시스템

## 🎨 주요 기능

### ✅ 완료된 기능
- 🔐 **인증 시스템**: JWT 기반 로그인/회원가입/토큰 갱신
- 📊 **대시보드**: 통계, 오늘 일정, 빠른 작업
- 🎨 **다크 모드**: 라이트/다크/시스템 테마
- 📱 **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- 🗄️ **데이터베이스**: 완전한 스키마 설계
- 🔔 **알림 시스템**: 이메일/푸시/인앱 알림
- 👥 **그룹 관리**: 협업 및 권한 시스템
- 🚀 **애니메이션**: 매끄러운 UI 전환

### 🚧 개발 진행 중
- 📅 **캘린더 뷰**: 월/주/일 보기 구현
- 📝 **이벤트 CRUD**: 완전한 이벤트 관리
- 🔄 **실시간 동기화**: WebSocket 실시간 업데이트
- 📊 **통계 및 분석**: 차트 및 리포트
- 🔍 **고급 검색**: 필터링 및 정렬

### 📅 향후 계획
- 📱 **모바일 앱**: React Native 또는 Flutter
- 🌐 **PWA**: 오프라인 지원
- 🤖 **AI 추천**: 일정 최적화 제안
- 📧 **이메일 템플릿**: 커스텀 알림 디자인
- 🔒 **2FA**: 이중 인증 보안

## 📊 프로젝트 현황

### 📁 파일 통계
- **총 파일 수**: 85개+
- **백엔드 파일**: 27개
- **프론트엔드 파일**: 35개+
- **문서 파일**: 15개
- **스크립트 파일**: 18개

### 💻 코드 라인 수 (추정)
- **백엔드**: ~3,500 lines
- **프론트엔드**: ~4,000 lines
- **문서**: ~2,000 lines
- **총합**: ~9,500+ lines

## 🛠️ 개발 환경 설정

### 백엔드 실행
```bash
cd src/backend
npm install
cp .env.example .env
npm run dev
```

### 프론트엔드 실행  
```bash
cd src/frontend
npm install
cp .env.example .env
npm run dev
```

### 전체 프로젝트 실행
```bash
# 터미널 1 - 백엔드
cd src/backend && npm run dev

# 터미널 2 - 프론트엔드  
cd src/frontend && npm run dev
```

## 🔗 GitHub 저장소
- **URL**: https://github.com/dongwoo314/Event-Scheduler
- **브랜치**: main
- **마지막 업데이트**: 프론트엔드 개발 환경 구축 완료

## 📋 GitHub 저장 방법

### 🎯 즉시 저장 (권장)
```cmd
save-frontend-to-github.bat
```

### 🔄 개별 저장 스크립트
- `complete-github-save.bat` - 전체 프로젝트
- `save-backend-to-github.bat` - 백엔드만
- `save-frontend-to-github.bat` - 프론트엔드 포함

## 🎓 학습 포인트

### 백엔드 개발
- RESTful API 설계
- 데이터베이스 모델링
- JWT 인증 구현
- 실시간 통신 (WebSocket)
- 보안 모범 사례

### 프론트엔드 개발
- 현대적 React 패턴
- TypeScript 활용
- 상태 관리 아키텍처
- 반응형 디자인
- 성능 최적화

### DevOps & 협업
- Git 워크플로우
- 프로젝트 구조화
- 문서화 및 주석
- 코드 품질 관리
- CI/CD 준비

## 🏆 프로젝트 특징

### 💡 혁신적 요소
- **AI 협업**: Claude와의 체계적 개발
- **모던 스택**: 최신 기술 스택 활용
- **사용자 중심**: 직관적 UX/UI 설계
- **확장 가능**: 마이크로서비스 준비 구조

### 🎯 차별화 포인트
- **스마트 알림**: 컨텍스트 기반 알림 시스템
- **실시간 협업**: 그룹 일정 실시간 동기화
- **크로스 플랫폼**: 웹/모바일 통합 경험
- **개인화**: 사용자 맞춤 설정

## 📈 다음 단계

### 🎯 단기 목표 (1-2주)
- [ ] 캘린더 뷰 완성
- [ ] 이벤트 CRUD 완전 구현
- [ ] WebSocket 실시간 통신
- [ ] 그룹 협업 기능

### 🚀 중기 목표 (1-2개월)
- [ ] 모바일 앱 개발
- [ ] PWA 구현
- [ ] 고급 알림 시스템
- [ ] 통계 및 분석

### 🌟 장기 목표 (3-6개월)
- [ ] AI 기반 일정 추천
- [ ] 외부 캘린더 연동
- [ ] 엔터프라이즈 기능
- [ ] 오픈소스 배포

---
**📅 마지막 업데이트**: 2024년 8월 25일  
**🎓 졸업작품**: 서울대학교 컴퓨터공학과  
**🤖 AI 협업**: Claude (Anthropic)  
**⭐ GitHub**: https://github.com/dongwoo314/Event-Scheduler
