@echo off
echo ================================
echo 🚀 Event Scheduler 백엔드 서버 시작
echo ================================
echo.

cd /d "C:\Users\김동우\Desktop\schedule-app-project\src\backend"

echo 📍 현재 디렉토리: %CD%
echo.

echo 📦 Node.js 및 npm 버전 확인...
node --version
npm --version
echo.

echo 🔍 package.json 확인...
if exist package.json (
    echo ✅ package.json 발견
) else (
    echo ❌ package.json을 찾을 수 없습니다!
    pause
    exit /b 1
)
echo.

echo 📦 node_modules 확인...
if exist node_modules (
    echo ✅ node_modules 폴더 존재
) else (
    echo ⚠️ node_modules가 없습니다. npm install을 실행합니다...
    npm install
    if errorlevel 1 (
        echo ❌ npm install 실패!
        pause
        exit /b 1
    )
)
echo.

echo 🗄️ 데이터베이스 파일 확인...
if exist database.sqlite (
    echo ✅ SQLite 데이터베이스 파일 발견
) else (
    echo ⚠️ 데이터베이스 파일이 없습니다. 초기화를 실행합니다...
    node init-db.js
    if errorlevel 1 (
        echo ❌ 데이터베이스 초기화 실패!
        pause
        exit /b 1
    )
)
echo.

echo 🔧 환경 변수 파일 확인...
if exist .env (
    echo ✅ .env 파일 발견
) else (
    echo ⚠️ .env 파일이 없습니다. .env.example을 복사합니다...
    copy .env.example .env
)
echo.

echo 🚀 서버를 시작합니다...
echo 📡 서버 주소: http://localhost:3001
echo 🏥 Health Check: http://localhost:3001/health
echo 📊 API 베이스: http://localhost:3001/api
echo.
echo 서버를 중지하려면 Ctrl+C를 누르세요.
echo.

npm run dev

pause
