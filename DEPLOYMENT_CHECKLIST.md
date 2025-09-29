# ✅ AWS Amplify 배포 체크리스트

발표 시연을 위한 단계별 체크리스트입니다. 하나씩 체크하며 진행하세요!

---

## 📋 사전 준비 (10분)

### AWS 계정
- [ ] AWS 계정 생성 완료
- [ ] 신용카드 등록 완료 (프리티어 사용)
- [ ] IAM 사용자 생성 (선택사항)

### GitHub 레포지토리
- [ ] GitHub 레포지토리 생성
- [ ] 로컬 프로젝트를 Git에 연결
- [ ] 모든 변경사항 커밋
- [ ] GitHub에 푸시 완료

### 로컬 테스트
- [ ] 프론트엔드 빌드 성공 (`npm run build`)
- [ ] 백엔드 정상 실행 확인 (`npm start`)
- [ ] 로컬에서 전체 기능 테스트 완료

---

## 🚀 1단계: 프론트엔드 배포 (Amplify) - 10분

### Amplify 앱 생성
- [ ] AWS Amplify Console 접속
- [ ] "New app" → "Host web app" 클릭
- [ ] GitHub 계정 연결
- [ ] 레포지토리 선택: `schedule-app-project`
- [ ] 브랜치 선택: `main`

### 빌드 설정
- [ ] App name 입력: `schedule-app`
- [ ] `amplify.yml` 파일 감지 확인
- [ ] Root directory: 비워두기

### 환경 변수 설정
- [ ] `VITE_API_URL`: `http://localhost:3001` (임시)
- [ ] `VITE_ENV`: `production`

### 배포 시작
- [ ] "Save and deploy" 클릭
- [ ] 빌드 로그 확인 (5-7분 대기)
- [ ] 배포 완료 확인
- [ ] ✅ **프론트엔드 URL 복사 및 저장**
  - URL: `____________________________`

---

## 🔧 2단계: 백엔드 배포 (App Runner) - 15분

### App Runner 서비스 생성
- [ ] AWS App Runner Console 접속
- [ ] "Create service" 클릭
- [ ] Source: GitHub 선택
- [ ] GitHub 계정 연결
- [ ] 레포지토리 선택: `schedule-app-project`
- [ ] 브랜치: `main`

### 소스 설정
- [ ] **Source directory**: `src/backend` ⚠️ 매우 중요!
- [ ] Deployment trigger: Automatic
- [ ] Configuration file: Use configuration file

### 서비스 설정
- [ ] Service name: `schedule-app-backend`
- [ ] Virtual CPU: 1 vCPU
- [ ] Memory: 2 GB
- [ ] Port: `3001`

### 환경 변수 설정 (매우 중요!)
- [ ] `NODE_ENV`: `production`
- [ ] `PORT`: `3001`
- [ ] `CORS_ORIGIN`: [위에서 복사한 프론트엔드 URL]
- [ ] `JWT_SECRET`: [32자 이상 랜덤 문자열]
- [ ] `JWT_REFRESH_SECRET`: [32자 이상 랜덤 문자열]
- [ ] `JWT_EXPIRES_IN`: `7d`
- [ ] `DB_TYPE`: `sqlite`
- [ ] `DB_STORAGE`: `./database.sqlite`

💡 JWT Secret 생성: https://randomkeygen.com

### 배포 시작
- [ ] "Create & deploy" 클릭
- [ ] 배포 로그 확인 (5-10분 대기)
- [ ] 배포 완료 확인
- [ ] Health check 통과 확인
- [ ] ✅ **백엔드 URL 복사 및 저장**
  - URL: `____________________________`

---

## 🔗 3단계: 연결 설정 (5분)

### 프론트엔드 환경 변수 업데이트
- [ ] Amplify Console로 이동
- [ ] 앱 선택 → "Environment variables"
- [ ] `VITE_API_URL` 편집
- [ ] 값을 백엔드 URL로 변경
- [ ] "Save" 클릭
- [ ] 자동 재배포 시작 확인 (3-5분)

### 백엔드 CORS 업데이트
- [ ] App Runner Console로 이동
- [ ] 서비스 선택 → "Configuration" 탭
- [ ] "Edit" 클릭
- [ ] `CORS_ORIGIN` 값을 프론트엔드 URL로 변경
- [ ] "Deploy" 클릭
- [ ] 재배포 완료 확인 (2-3분)

---

## 🧪 4단계: 테스트 (5분)

### 기본 접속 테스트
- [ ] 프론트엔드 URL 접속
- [ ] 페이지 로드 확인
- [ ] 콘솔 에러 없는지 확인

### 기능 테스트
- [ ] 회원가입 기능 테스트
- [ ] 로그인 기능 테스트
- [ ] 주요 기능 동작 확인
- [ ] 모바일 반응형 확인

### API 연결 테스트
- [ ] 네트워크 탭에서 API 호출 확인
- [ ] API 응답 정상 확인
- [ ] CORS 에러 없는지 확인

---

## 📱 5단계: 발표 준비 (10분)

### QR 코드 생성
- [ ] https://www.qr-code-generator.com 접속
- [ ] 프론트엔드 URL 입력
- [ ] QR 코드 다운로드
- [ ] PPT에 삽입

### 데모 데이터 준비
- [ ] 테스트 계정 생성
  - 이메일: `____________________________`
  - 비밀번호: `____________________________`
- [ ] 샘플 이벤트 생성
- [ ] 샘플 그룹 생성

### 발표 자료 업데이트
- [ ] PPT에 라이브 URL 추가
- [ ] QR 코드 추가
- [ ] 스크린샷 업데이트

### 백업 계획
- [ ] 로컬 환경 데모 준비
- [ ] 스크린샷/비디오 준비
- [ ] 발표 스크립트 작성

---

## 🎯 발표 당일 체크리스트

### 발표 전 (1시간 전)
- [ ] 프론트엔드 URL 접속 확인
- [ ] 백엔드 API 응답 확인
- [ ] 테스트 계정 로그인 확인
- [ ] 모든 기능 동작 확인
- [ ] 발표장 Wi-Fi 연결 테스트

### 발표 중
- [ ] QR 코드 화면에 표시
- [ ] URL 소리내어 안내
- [ ] 실제 동작 시연
- [ ] 청중 접속 유도

### 발표 후
- [ ] 질문 대응 준비
- [ ] URL 공유 (이메일/카카오톡)

---

## 💰 비용 확인

### 프리티어 사용량
- [ ] Amplify: 빌드 시간 확인
- [ ] App Runner: 실행 시간 확인
- [ ] 예상 비용: **$0/월** ✅

### 발표 후 정리 (선택사항)
- [ ] Amplify 앱 일시 중지 또는 삭제
- [ ] App Runner 서비스 일시 중지 또는 삭제
- [ ] RDS 인스턴스 중지 (사용한 경우)

---

## 🆘 트러블슈팅 체크리스트

### 빌드 실패 시
- [ ] GitHub 레포지토리 구조 확인
- [ ] `amplify.yml` 파일 위치 확인
- [ ] 로컬에서 빌드 테스트
- [ ] 빌드 로그 확인

### CORS 에러 시
- [ ] 백엔드 `CORS_ORIGIN` 환경 변수 확인
- [ ] 프론트엔드 URL 정확히 입력했는지 확인
- [ ] https:// 포함 여부 확인
- [ ] 슬래시(/) 끝에 있는지 확인
- [ ] App Runner 재배포

### API 연결 안 됨
- [ ] 프론트엔드 `VITE_API_URL` 확인
- [ ] 백엔드 URL 정확히 입력했는지 확인
- [ ] 백엔드 Health check 통과 확인
- [ ] 네트워크 탭에서 요청 URL 확인

### 페이지가 안 열림
- [ ] Amplify 빌드 로그 확인
- [ ] `amplify.yml` 파일 문법 확인
- [ ] 브라우저 캐시 삭제
- [ ] 시크릿 모드에서 접속 시도

---

## 📞 도움 요청

문제가 해결되지 않으면:
1. **빌드 로그** 스크린샷 찍기
2. **에러 메시지** 복사하기
3. **환경 변수** 설정 확인하기
4. DEPLOYMENT_GUIDE.md 트러블슈팅 섹션 참고

---

## 🎉 배포 완료!

모든 체크리스트를 완료했다면 축하합니다! 🎊

### 최종 확인
- [ ] ✅ 프론트엔드 URL: `____________________________`
- [ ] ✅ 백엔드 URL: `____________________________`
- [ ] ✅ 테스트 계정: `____________________________`
- [ ] ✅ QR 코드 준비 완료
- [ ] ✅ 발표 자료 업데이트 완료

### 다음 단계
1. 이력서/포트폴리오에 라이브 URL 추가
2. GitHub README에 라이브 데모 링크 추가
3. 팀원들과 URL 공유
4. 발표 연습!

---

**🚀 발표에서 멋진 시연 하세요! Good Luck! 🍀**
