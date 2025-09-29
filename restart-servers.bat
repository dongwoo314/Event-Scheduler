@echo off
echo ==========================================
echo 🔄 Node.js 프로세스 정리 및 서버 재시작
echo ==========================================
echo.

echo 🛑 현재 실행 중인 Node.js 프로세스를 모두 종료합니다...
taskkill /IM node.exe /F 2>nul
if errorlevel 1 (
    echo ⚠️  실행 중인 Node.js 프로세스가 없습니다.
) else (
    echo ✅ Node.js 프로세스가 종료되었습니다.
)

echo.
echo 🧹 포트 정리 중...
timeout /t 2 /nobreak >nul

echo ✅ 정리 완료!
echo.
echo 🚀 이제 서버를 수동으로 시작합니다...
echo ==========================================
echo.

echo 📋 단계별 실행 가이드:
echo.
echo 1️⃣ 첫 번째 터미널 (백엔드):
echo    cd C:\Users\김동우\Desktop\schedule-app-project\src\backend
echo    npm run dev
echo.
echo 2️⃣ 두 번째 터미널 (프론트엔드):
echo    cd C:\Users\김동우\Desktop\schedule-app-project\src\frontend  
echo    npm run dev
echo.
echo ⚠️  중요: 백엔드가 완전히 시작된 후 프론트엔드를 시작하세요!
echo ⚠️  각 터미널에서 에러 메시지가 나오는지 주의깊게 확인하세요!
echo.

pause

echo.
echo 🔄 자동으로 백엔드 서버를 시작합니다...
echo 📂 백엔드 디렉토리로 이동 중...

cd /d "C:\Users\김동우\Desktop\schedule-app-project\src\backend"

echo 📍 현재 위치: %CD%
echo.
echo 🗄️  데이터베이스 상태 확인...
if exist database.sqlite (
    echo ✅ SQLite 데이터베이스 존재
) else (
    echo ⚠️  데이터베이스가 없습니다. 초기화를 실행합니다...
    node init-db.js
    if errorlevel 1 (
        echo ❌ 데이터베이스 초기화 실패!
        pause
        exit /b 1
    )
)

echo.
echo 🚀 백엔드 서버 시작...
echo 📡 포트 3001에서 서버가 시작됩니다...
echo.
echo 👀 다음 메시지들을 확인하세요:
echo    ✅ "Server running successfully!"
echo    ✅ "Port: 3001"  
echo    ✅ "Health check: http://localhost:3001/health"
echo.
echo 🔴 에러가 발생하면 Ctrl+C로 중지하고 에러 내용을 확인하세요!
echo.

npm run dev
