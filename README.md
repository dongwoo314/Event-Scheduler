# 📅 Schedule App - 스케줄 관리 시스템

졸업작품 발표 및 시연을 위한 이벤트 스케줄 관리 애플리케이션

## 🌐 라이브 데모

- **프론트엔드**: [배포 후 URL 추가]
- **백엔드 API**: [배포 후 URL 추가]

---

## 📚 배포 가이드

### 빠른 시작 (발표 시연용)
👉 **[QUICK_DEPLOY_GUIDE.md](./QUICK_DEPLOY_GUIDE.md)** - 30분 안에 배포 완료

### 상세 가이드
👉 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - 전체 배포 프로세스

---

## 🚀 로컬 실행 방법

### 사전 요구사항
- Node.js 16 이상
- npm 8 이상

### 1. 프론트엔드 실행
```bash
cd src/frontend
npm install
npm run dev
```
접속: http://localhost:3000

### 2. 백엔드 실행
```bash
cd src/backend
npm install
npm run dev
```
API: http://localhost:3001

---

## 📦 프로젝트 구조

```
schedule-app-project/
├── src/
│   ├── frontend/          # React + Vite 프론트엔드
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   └── ...
│   │   └── package.json
│   │
│   └── backend/           # Node.js + Express 백엔드
│       ├── routes/
│       ├── models/
│       ├── controllers/
│       ├── services/
│       └── server.js
│
├── amplify.yml            # AWS Amplify 빌드 설정
├── QUICK_DEPLOY_GUIDE.md  # 빠른 배포 가이드
└── DEPLOYMENT_GUIDE.md    # 상세 배포 가이드
```

---

## 🛠️ 주요 기능

- ✅ 사용자 인증 (회원가입/로그인)
- ✅ 이벤트 생성 및 관리
- ✅ 그룹 관리
- ✅ 알림 시스템
- ✅ 실시간 업데이트 (WebSocket)

---

## 🔧 기술 스택

### 프론트엔드
- React 18
- Vite
- React Router
- Zustand (상태 관리)
- TailwindCSS
- Axios

### 백엔드
- Node.js
- Express
- Sequelize (ORM)
- SQLite / PostgreSQL
- Socket.io
- JWT 인증

---

## 🌍 배포 환경

- **호스팅**: AWS Amplify (프론트엔드)
- **서버**: AWS App Runner (백엔드)
- **데이터베이스**: AWS RDS PostgreSQL
- **CI/CD**: GitHub 연동 자동 배포

---

## 📝 환경 변수 설정

### 프론트엔드 (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_ENV=development
```

### 백엔드 (.env)
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-secret-key
DB_TYPE=sqlite
```

자세한 내용은 `.env.example` 파일 참고

---

## 🎓 개발팀

- **팀명**: [팀명 입력]
- **프로젝트**: 졸업작품 - 스케줄 관리 시스템
- **기간**: [개발 기간]

---

## 📄 라이선스

MIT License

---

## 🆘 문제 해결

배포 중 문제가 발생하면:
1. [QUICK_DEPLOY_GUIDE.md](./QUICK_DEPLOY_GUIDE.md)의 트러블슈팅 섹션 확인
2. GitHub Issues에 질문 등록
3. 로컬 환경에서 먼저 테스트

---

## 🎯 발표 준비

발표 시연을 위한 체크리스트:
- [ ] 배포 완료 및 URL 확인
- [ ] 데모 계정 생성
- [ ] QR 코드 준비
- [ ] 주요 기능 테스트
- [ ] 백업 계획 (로컬 데모)

---

**Made with ❤️ by [팀명]**
