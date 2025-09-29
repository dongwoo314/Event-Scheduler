@echo off
echo ==========================================
echo 🔍 백엔드 서버 상태 진단
echo ==========================================
echo.

echo 📍 백엔드 디렉토리로 이동...
cd /d "C:\Users\김동우\Desktop\schedule-app-project\src\backend"

echo 📋 현재 디렉토리: %CD%
echo.

echo 🔍 필수 파일 확인...
if exist server.js (
    echo ✅ server.js 존재
) else (
    echo ❌ server.js 없음!
    pause
    exit /b 1
)

if exist package.json (
    echo ✅ package.json 존재
) else (
    echo ❌ package.json 없음!
    pause
    exit /b 1
)

if exist node_modules (
    echo ✅ node_modules 존재
) else (
    echo ❌ node_modules 없음! npm install이 필요합니다.
    pause
    exit /b 1
)

echo.
echo 🗄️ 데이터베이스 파일 확인...
if exist database.sqlite (
    echo ✅ SQLite 데이터베이스 존재
    dir database.sqlite
) else (
    echo ⚠️ SQLite 데이터베이스 없음. 초기화를 실행합니다...
    node init-db.js
)

echo.
echo 🔧 환경 변수 확인...
if exist .env (
    echo ✅ .env 파일 존재
    echo 📋 환경 변수 내용:
    type .env
) else (
    echo ❌ .env 파일 없음!
)

echo.
echo 🚀 서버 테스트 시작...
echo 📡 포트 3001에서 서버를 시작합니다...
echo 🔗 테스트 URL: http://localhost:3001/health
echo.
echo Ctrl+C를 눌러서 중지할 수 있습니다.
echo ==========================================
echo.

npm run dev
