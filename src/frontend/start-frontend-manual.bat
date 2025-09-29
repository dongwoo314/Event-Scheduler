@echo off
echo ==========================================
echo 🎨 프론트엔드 서버 시작
echo ==========================================
echo.

echo ⚠️  백엔드 서버가 먼저 실행되어야 합니다!
echo ⚠️  백엔드에서 "Server running successfully!" 메시지를 확인했나요?
echo.

choice /c yn /m "백엔드가 정상적으로 실행 중인가요? [Y/N]"
if errorlevel 2 (
    echo.
    echo ❌ 먼저 백엔드를 시작하세요:
    echo    restart-servers.bat 실행
    pause
    exit /b 1
)

echo.
echo 📂 프론트엔드 디렉토리로 이동...
cd /d "C:\Users\김동우\Desktop\schedule-app-project\src\frontend"

echo 📍 현재 위치: %CD%
echo.

echo 🔧 환경 변수 확인...
if exist .env (
    echo ✅ .env 파일 존재
    echo 📋 API 설정:
    findstr "VITE_API_BASE_URL" .env
) else (
    echo ⚠️  .env 파일이 없습니다. 생성합니다...
    echo VITE_API_BASE_URL=http://localhost:3001/api > .env
)

echo.
echo 🎨 프론트엔드 서버 시작...
echo 🌐 프론트엔드 주소: http://localhost:3000
echo 🔗 백엔드 연동: http://localhost:3001/api
echo.
echo 👀 다음 메시지들을 확인하세요:
echo    ✅ "Local: http://localhost:3000"
echo    ✅ "ready in XXXms"
echo.
echo 🔴 컴파일 에러가 발생하면 에러 내용을 확인하세요!
echo.

npm run dev
