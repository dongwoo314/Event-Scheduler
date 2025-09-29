# ⚡ 빠른 배포 가이드 (30분 완성)

발표 시연을 위한 빠른 배포 가이드입니다.

## 🎯 목표
로컬 환경이 아닌 **인터넷에서 접속 가능한 URL**로 프로젝트 시연하기

---

## ✅ 사전 준비 (5분)

### 1. AWS 계정 만들기
- https://aws.amazon.com 접속
- 이메일과 신용카드로 가입 (프리티어는 무료)
- **중요**: 프리티어는 12개월 무료입니다

### 2. GitHub 레포지토리 확인
```bash
# 현재 디렉토리에서 실행
git remote -v
```
- 만약 레포지토리가 없다면:
```bash
# GitHub에서 새 레포지토리 생성 후
git init
git add .
git commit -m "Initial commit for deployment"
git remote add origin https://github.com/your-username/schedule-app-project.git
git push -u origin main
```

---

## 🚀 배포 3단계

### STEP 1: 배포 준비 스크립트 실행 (2분)

```bash
# Windows
.\prepare-deployment.bat

# Mac/Linux
chmod +x prepare-deployment.sh
./prepare-deployment.sh
```

이 스크립트는 자동으로:
- ✅ 의존성 확인 및 설치
- ✅ 빌드 테스트
- ✅ 필수 파일 확인
- ✅ Git 커밋 확인

---

### STEP 2: 프론트엔드 배포 (Amplify) (10분)

#### 2-1. AWS Amplify 접속
1. https://console.aws.amazon.com/amplify 접속
2. **"New app"** → **"Host web app"** 클릭
3. **GitHub** 선택 및 연결
4. 레포지토리: `schedule-app-project` 선택
5. 브랜치: `main` 선택

#### 2-2. 빌드 설정
- **App name**: schedule-app
- Amplify가 자동으로 `amplify.yml` 감지
- **Root directory**: 비워두기 (자동 감지됨)

#### 2-3. 환경 변수 설정
**"Advanced settings"** 클릭 후 추가:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `http://localhost:3001` (임시, 나중에 변경) |
| `VITE_ENV` | `production` |

#### 2-4. 배포 시작
- **"Save and deploy"** 클릭
- 5-7분 대기
- 배포 완료 후 URL 복사 (예: `https://main.d1a2b3c4.amplifyapp.com`)

✅ **프론트엔드 배포 완료!**

---

### STEP 3: 백엔드 배포 (App Runner) (15분)

#### 3-1. AWS App Runner 접속
1. https://console.aws.amazon.com/apprunner 접속
2. **"Create service"** 클릭
3. **Source**: Repository - Connect to GitHub

#### 3-2. 소스 설정
- **Repository**: `schedule-app-project` 선택
- **Branch**: `main`
- **Source directory**: `src/backend` ⚠️ 중요!
- **Deployment trigger**: Automatic

#### 3-3. 빌드 설정
- **Configuration file**: Use a configuration file
- 또는 Manual 선택 시:
  - **Runtime**: Node.js 16
  - **Build command**: `npm install`
  - **Start command**: `node server.js`
  - **Port**: `3001`

#### 3-4. 서비스 설정
- **Service name**: `schedule-app-backend`
- **Virtual CPU**: 1 vCPU (충분함)
- **Memory**: 2 GB

#### 3-5. 환경 변수 설정 ⚠️ 매우 중요!

**"Add environment variable"** 클릭하여 다음 변수들을 추가:

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://main.d1a2b3c4.amplifyapp.com

# JWT Secrets (랜덤 문자열 32자 이상)
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-minimum-32-characters-here
JWT_EXPIRES_IN=7d

# SQLite 사용 (간단한 시연용)
DB_TYPE=sqlite
DB_STORAGE=./database.sqlite

# 또는 PostgreSQL 사용 시 (RDS 설정 필요)
# DB_HOST=your-rds-endpoint.rds.amazonaws.com
# DB_PORT=5432
# DB_NAME=schedule_app
# DB_USERNAME=admin
# DB_PASSWORD=your-password
```

💡 **팁**: JWT_SECRET는 https://randomkeygen.com 에서 생성 가능

#### 3-6. 배포 시작
- **"Create & deploy"** 클릭
- 5-10분 대기
- 배포 완료 후 URL 복사 (예: `https://abc123.us-east-1.awsapprunner.com`)

✅ **백엔드 배포 완료!**

---

### STEP 4: 프론트엔드와 백엔드 연결 (3분)

#### 4-1. 프론트엔드 환경 변수 업데이트
1. AWS Amplify Console로 돌아가기
2. 앱 선택 → 좌측 메뉴 **"Environment variables"**
3. `VITE_API_URL` 편집:
   - **새 값**: `https://abc123.us-east-1.awsapprunner.com` (백엔드 URL)
4. **"Save"** 클릭
5. 자동으로 재배포 시작 (3-5분)

#### 4-2. 백엔드 CORS 업데이트
1. AWS App Runner Console로 돌아가기
2. 서비스 선택 → **"Configuration"** 탭
3. **"Edit"** 클릭
4. `CORS_ORIGIN` 변수 수정:
   - **새 값**: `https://main.d1a2b3c4.amplifyapp.com` (프론트엔드 URL)
5. **"Deploy"** 클릭 (2-3분)

✅ **연결 완료!**

---

## 🎉 배포 완료! 테스트하기

### 1. 접속 테스트
- 프론트엔드 URL로 접속: `https://main.xxxxx.amplifyapp.com`
- 페이지가 정상적으로 로드되는지 확인

### 2. 기능 테스트
1. **회원가입** 테스트
2. **로그인** 테스트
3. **주요 기능** 테스트

### 3. 문제 발생 시
- **프론트엔드 로그**: Amplify Console → Build 탭 → Logs
- **백엔드 로그**: App Runner Console → Logs 탭

---

## 📱 발표 준비

### 1. QR 코드 생성 (청중이 직접 접속할 수 있게)
- https://www.qr-code-generator.com 접속
- URL 입력 후 QR 코드 다운로드
- PPT에 삽입

### 2. 데모 데이터 준비
```bash
# 로컬에서 데모 사용자 생성 후 배포된 DB에 추가
# 또는 배포된 사이트에서 직접 회원가입
```

### 3. 발표 스크립트 예시
```
"저희 프로젝트는 실제로 배포되어 있어서,
지금 바로 접속해서 사용하실 수 있습니다.

[QR 코드 보여주며]
스마트폰으로 이 QR 코드를 스캔하시면
직접 체험해보실 수 있습니다.

URL은 https://main.xxxxx.amplifyapp.com 입니다."
```

---

## 💰 비용 (프리티어)

- **Amplify Hosting**: $0/월 (빌드 1000분, 15GB 전송)
- **App Runner**: $0/월 (100시간)
- **총 예상 비용**: **$0/월** ✅

⚠️ 프리티어는 가입 후 12개월간 무료

---

## 🔥 배포 후 해야 할 것

### 즉시
- [ ] URL 동작 확인
- [ ] 회원가입/로그인 테스트
- [ ] 주요 기능 테스트
- [ ] QR 코드 생성

### 발표 전날
- [ ] 다시 한번 동작 확인
- [ ] 데모 계정 생성
- [ ] 백업 계획 (로컬 데모) 준비

### 발표 당일
- [ ] 발표장 Wi-Fi 확인
- [ ] 모바일/데스크톱 모두 테스트
- [ ] 로그인 정보 메모

---

## ⚠️ 주의사항

### 1. SQLite vs PostgreSQL
- **시연만 할 경우**: SQLite 사용 (간단, RDS 불필요)
- **장기 운영 계획**: PostgreSQL + RDS 권장

### 2. 보안
- JWT_SECRET은 절대 GitHub에 올리지 마세요
- .env 파일은 .gitignore에 포함되어 있어야 합니다

### 3. 비용
- 프리티어 한도 초과 시 과금될 수 있으니 주의
- 발표 후 서비스를 중지하려면:
  - Amplify 앱 삭제
  - App Runner 서비스 삭제

---

## 🆘 트러블슈팅

### 문제 1: 빌드 실패
```
원인: package.json 의존성 문제
해결: 로컬에서 npm install 후 빌드 테스트
```

### 문제 2: CORS 에러
```
원인: 백엔드 CORS_ORIGIN 설정 오류
해결: 프론트엔드 정확한 URL로 업데이트
```

### 문제 3: API 연결 안됨
```
원인: VITE_API_URL 설정 오류
해결: 백엔드 정확한 URL로 업데이트
```

### 문제 4: 페이지가 안 열림
```
원인: 빌드 설정 오류
해결: amplify.yml 파일 확인
```

---

## 📞 도움이 필요하면

1. **AWS 지원**: https://console.aws.amazon.com/support
2. **Amplify 문서**: https://docs.aws.amazon.com/amplify/
3. **App Runner 문서**: https://docs.aws.amazon.com/apprunner/

---

## ✅ 최종 체크리스트

배포 완료 후 확인:

- [ ] 프론트엔드 URL 접속됨
- [ ] 백엔드 API 응답 정상
- [ ] 회원가입 동작
- [ ] 로그인 동작
- [ ] 주요 기능 동작
- [ ] 모바일 반응형 확인
- [ ] QR 코드 생성 완료
- [ ] 발표 자료에 URL 추가

---

## 🎓 배포 성공하면...

축하합니다! 🎉

이제 다음을 할 수 있습니다:
- ✅ 발표에서 실제 동작하는 시스템 시연
- ✅ 청중이 직접 접속해서 체험
- ✅ 이력서/포트폴리오에 라이브 URL 추가
- ✅ CI/CD 경험 (GitHub → 자동 배포)

---

더 궁금한 점이 있으면 언제든지 질문하세요! 🚀
