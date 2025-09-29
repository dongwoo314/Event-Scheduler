@echo off
echo ==========================================
echo 🚀 Event Scheduler 전체 시스템 실행
echo ==========================================
echo.

echo 🔍 시스템 요구사항 확인...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js가 설치되지 않았습니다!
    echo    https://nodejs.org에서 Node.js를 다운로드하세요.
    pause
    exit /b 1
)

echo ✅ Node.js 설치 확인
node --version
npm --version
echo.

echo 📁 프로젝트 디렉토리 확인...
cd /d "C:\Users\김동우\Desktop\schedule-app-project"

if not exist "src\backend" (
    echo ❌ 백엔드 폴더를 찾을 수 없습니다!
    pause
    exit /b 1
)

if not exist "src\frontend" (
    echo ❌ 프론트엔드 폴더를 찾을 수 없습니다!
    pause
    exit /b 1
)

echo ✅ 프로젝트 구조 확인 완료
echo.

echo 🗄️ 백엔드 의존성 확인...
cd src\backend
if not exist node_modules (
    echo ⚠️ 백엔드 의존성을 설치합니다...
    npm install
    if errorlevel 1 (
        echo ❌ 백엔드 의존성 설치 실패!
        pause
        exit /b 1
    )
)

echo ✅ 백엔드 준비 완료
echo.

echo 🎨 프론트엔드 의존성 확인...
cd ..\frontend
if not exist node_modules (
    echo ⚠️ 프론트엔드 의존성을 설치합니다...
    npm install
    if errorlevel 1 (
        echo ❌ 프론트엔드 의존성 설치 실패!
        pause
        exit /b 1
    )
)

echo ✅ 프론트엔드 준비 완료
echo.

echo 🚀 서버 시작 안내...
echo ==========================================
echo 
echo 다음 단계로 진행하세요:
echo.
echo 1️⃣ 첫 번째 터미널: 백엔드 서버 시작
echo    📂 경로: src\backend
echo    🔧 명령어: npm run dev
echo    🌐 주소: http://localhost:3001
echo.
echo 2️⃣ 두 번째 터미널: 프론트엔드 서버 시작  
echo    📂 경로: src\frontend
echo    🔧 명령어: npm run dev
echo    🌐 주소: http://localhost:3000
echo.
echo 3️⃣ 브라우저에서 테스트
echo    🔗 로그인: http://localhost:3000/login
echo    🔗 회원가입: http://localhost:3000/register
echo    🔗 API 상태: http://localhost:3001/health
echo.
echo ==========================================

echo.
echo 🎯 자동 실행을 원하시나요?
choice /c yn /m "백엔드와 프론트엔드를 자동으로 시작하시겠습니까? [Y/N]"

if errorlevel 2 goto manual
if errorlevel 1 goto auto

:auto
echo.
echo 🔄 자동 실행 모드...
echo ⚠️ 두 개의 새 터미널 창이 열립니다.

echo 🗄️ 백엔드 서버 시작...
start "Event Scheduler Backend" cmd /k "cd /d C:\Users\김동우\Desktop\schedule-app-project\src\backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 🎨 프론트엔드 서버 시작...
start "Event Scheduler Frontend" cmd /k "cd /d C:\Users\김동우\Desktop\schedule-app-project\src\frontend && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ✅ 서버 시작 완료!
echo 🌐 프론트엔드: http://localhost:3000
echo 🔧 백엔드: http://localhost:3001
echo.
echo 브라우저에서 http://localhost:3000 을 열어서 테스트하세요!

timeout /t 3 /nobreak >nul
start http://localhost:3000
goto end

:manual
echo.
echo 📋 수동 실행 가이드:
echo.
echo 터미널 1 (백엔드):
echo cd C:\Users\김동우\Desktop\schedule-app-project\src\backend
echo npm run dev
echo.
echo 터미널 2 (프론트엔드):
echo cd C:\Users\김동우\Desktop\schedule-app-project\src\frontend  
echo npm run dev
echo.

:end
echo.
echo 🎉 Event Scheduler 시작 완료!
echo 🔧 문제가 있으면 각 터미널의 로그를 확인하세요.
echo.
pause
