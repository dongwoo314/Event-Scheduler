# AWS Amplify 배포 가이드

## 📋 배포 전 준비사항

### 1. AWS 계정 생성
- [AWS Console](https://aws.amazon.com) 접속
- 계정 생성 (신용카드 필요, 프리티어는 무료)

### 2. GitHub 레포지토리 준비
- 프로젝트가 GitHub에 푸시되어 있어야 합니다
- Private/Public 모두 가능합니다

---

## 🚀 STEP 1: AWS Amplify 앱 생성

### 1-1. AWS Amplify Console 접속
1. AWS Console에 로그인
2. 검색창에 "Amplify" 입력
3. "AWS Amplify" 서비스 선택

### 1-2. 새 앱 생성
1. **"New app"** → **"Host web app"** 클릭
2. **GitHub** 선택
3. GitHub 계정 연동 (처음이면 OAuth 인증)
4. 레포지토리 선택: `schedule-app-project`
5. 브랜치 선택: `main` (또는 사용 중인 브랜치)

---

## 🔧 STEP 2: 빌드 설정

### 2-1. 빌드 설정 확인
- Amplify가 자동으로 `amplify.yml` 파일을 감지합니다
- 아래 내용이 표시되는지 확인:

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - cd src/frontend
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: src/frontend/dist
        files:
          - '**/*'
```

### 2-2. 환경 변수 설정 (프론트엔드)
**"Advanced settings"** → **"Environment variables"** 클릭

다음 변수들을 추가:
- `VITE_API_URL`: 백엔드 API URL (나중에 설정)
- `VITE_ENV`: `production`

---

## 🗄️ STEP 3: 백엔드 배포 (AWS Elastic Beanstalk 또는 App Runner)

### 옵션 A: AWS App Runner (추천, 더 간단)

#### 3-1. App Runner 서비스 생성
1. AWS Console에서 "App Runner" 검색
2. **"Create service"** 클릭
3. **Source**: GitHub 선택
4. 레포지토리 연결 및 선택
5. **Source directory**: `src/backend` 입력
6. **Runtime**: Node.js 16 선택

#### 3-2. 빌드 설정
- **Build command**: `npm install`
- **Start command**: `node server.js`
- **Port**: `3001`

#### 3-3. 환경 변수 설정
다음 환경 변수들을 추가:
```
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-amplify-app-url.amplifyapp.com

# Database (RDS 연결)
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=schedule_app
DB_USERNAME=admin
DB_PASSWORD=your-secure-password

# JWT Secrets
JWT_SECRET=your-production-jwt-secret-minimum-32-chars
JWT_REFRESH_SECRET=your-production-refresh-secret-minimum-32-chars
JWT_EXPIRES_IN=7d

# 기타 필요한 환경 변수...
```

#### 3-4. 배포
- **"Create & deploy"** 클릭
- 5-10분 후 백엔드 URL 확인 (예: `https://abc123.us-east-1.awsapprunner.com`)

---

### 옵션 B: AWS Elastic Beanstalk

#### 3-1. EB CLI 설치
```bash
pip install awsebcli
```

#### 3-2. 백엔드 디렉토리에서 초기화
```bash
cd src/backend
eb init -p node.js-18 schedule-app-backend --region us-east-1
```

#### 3-3. 환경 생성 및 배포
```bash
eb create schedule-app-backend-env
eb deploy
```

---

## 🔗 STEP 4: 프론트엔드와 백엔드 연결

### 4-1. 백엔드 URL을 프론트엔드 환경 변수에 추가
1. Amplify Console로 돌아가기
2. 앱 선택 → **"Environment variables"**
3. `VITE_API_URL` 업데이트:
   - 값: `https://your-backend-url.awsapprunner.com`
4. **"Save"** 클릭

### 4-2. 백엔드 CORS 업데이트
1. App Runner (또는 EB) 환경 변수에서 `CORS_ORIGIN` 업데이트
2. 값: `https://main.your-amplify-app-id.amplifyapp.com`

### 4-3. 재배포
- Amplify: 자동으로 재빌드됨
- App Runner: 자동으로 재배포됨

---

## 🗄️ STEP 5: 데이터베이스 설정 (RDS PostgreSQL)

### 5-1. RDS 인스턴스 생성
1. AWS Console에서 "RDS" 검색
2. **"Create database"** 클릭
3. **Engine**: PostgreSQL 선택
4. **Template**: Free tier (프리티어용)
5. **Settings**:
   - DB instance identifier: `schedule-app-db`
   - Master username: `admin`
   - Master password: 안전한 비밀번호 설정
6. **Instance configuration**:
   - Burstable classes: db.t3.micro (프리티어)
7. **Storage**: 20 GB (프리티어 최대)
8. **Connectivity**:
   - Public access: Yes (개발용, 프로덕션에서는 VPC 사용)
   - VPC security group: 새로 생성
9. **"Create database"** 클릭

### 5-2. 보안 그룹 설정
1. RDS 인스턴스 선택
2. **"Connectivity & security"** 탭
3. Security group 클릭
4. **Inbound rules** 편집
5. PostgreSQL (5432) 포트를 My IP에서 접근 가능하도록 추가

### 5-3. 데이터베이스 초기화
```bash
# 로컬에서 RDS 연결 테스트
psql -h your-rds-endpoint.rds.amazonaws.com -U admin -d postgres

# 데이터베이스 생성
CREATE DATABASE schedule_app;

# 테이블 생성 (init-db.js 실행)
node init-db.js
```

---

## ✅ STEP 6: 배포 완료 및 테스트

### 6-1. URL 확인
- **프론트엔드**: `https://main.xxxxx.amplifyapp.com`
- **백엔드**: `https://xxxxx.awsapprunner.com`

### 6-2. 동작 테스트
1. 프론트엔드 URL 접속
2. 회원가입/로그인 테스트
3. 주요 기능 테스트

---

## 💰 비용 예상 (프리티어 기준)

| 서비스 | 프리티어 | 예상 비용 |
|--------|----------|-----------|
| **Amplify Hosting** | 월 15GB 저장, 15GB 데이터 전송 | **$0/월** (프리티어 내) |
| **App Runner** | 월 100시간 | **$0/월** (프리티어 내) |
| **RDS PostgreSQL** | db.t3.micro 750시간, 20GB 스토리지 | **$0/월** (프리티어 내) |
| **총 예상 비용** | | **$0/월** |

⚠️ **주의**: 프리티어는 AWS 가입 후 12개월간 무료입니다.

---

## 🔧 트러블슈팅

### 문제 1: 빌드 실패
- **원인**: 의존성 설치 실패
- **해결**: `package.json`의 engines 필드 확인

### 문제 2: API 연결 실패
- **원인**: CORS 설정 문제
- **해결**: 백엔드 CORS_ORIGIN에 프론트엔드 URL 추가

### 문제 3: 데이터베이스 연결 실패
- **원인**: RDS 보안 그룹 설정
- **해결**: 인바운드 규칙에서 App Runner IP 허용

---

## 📚 추가 리소스

- [AWS Amplify 문서](https://docs.aws.amazon.com/amplify/)
- [AWS App Runner 문서](https://docs.aws.amazon.com/apprunner/)
- [AWS RDS 문서](https://docs.aws.amazon.com/rds/)

---

## 🎯 발표 시연 체크리스트

- [ ] 프론트엔드 배포 완료
- [ ] 백엔드 배포 완료
- [ ] 데이터베이스 연결 완료
- [ ] 회원가입/로그인 테스트
- [ ] 주요 기능 동작 확인
- [ ] 모바일 반응형 확인
- [ ] URL 공유 준비 (QR 코드 생성 추천)

---

## 💡 발표 팁

1. **QR 코드 생성**: URL을 QR 코드로 만들어서 청중이 직접 접속할 수 있게 하세요
2. **데모 데이터**: 미리 테스트 데이터를 넣어두세요
3. **백업 계획**: 만약을 위해 로컬 데모도 준비하세요
4. **네트워크 체크**: 발표 장소의 Wi-Fi 확인

---

배포 과정에서 문제가 생기면 언제든지 질문해주세요! 🚀
