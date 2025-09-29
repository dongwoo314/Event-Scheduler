@echo off
echo ==========================================
echo 🔍 실시간 서버 연결 상태 진단
echo ==========================================
echo.

echo 📡 포트 사용 현황 확인...
echo.
echo 🔍 포트 3001 (백엔드) 상태:
netstat -ano | findstr :3001
echo.
echo 🔍 포트 3000 (프론트엔드) 상태:
netstat -ano | findstr :3000
echo.

echo 🌐 백엔드 Health Check 테스트...
echo 📡 http://localhost:3001/health 요청 중...
curl -i http://localhost:3001/health 2>nul
if errorlevel 1 (
    echo ❌ 백엔드 서버에 연결할 수 없습니다!
    echo.
    echo 💡 가능한 원인:
    echo    - 서버가 실제로 실행되지 않음
    echo    - 포트 3001이 차단됨
    echo    - 서버 시작 중 오류 발생
) else (
    echo ✅ 백엔드 서버 연결 성공!
)

echo.
echo 🌐 프론트엔드 접속 테스트...
echo 📡 http://localhost:3000 요청 중...
curl -I http://localhost:3000 2>nul
if errorlevel 1 (
    echo ❌ 프론트엔드 서버에 연결할 수 없습니다!
) else (
    echo ✅ 프론트엔드 서버 연결 성공!
)

echo.
echo 🔍 Node.js 프로세스 확인...
echo 실행 중인 Node.js 프로세스:
tasklist | findstr node.exe
echo.

echo 📋 서버 로그 확인을 위한 가이드:
echo ==========================================
echo 1. 백엔드 서버 터미널에서 다음 메시지 확인:
echo    ✅ "Server running successfully!"
echo    ✅ "Port: 3001"
echo    ✅ "Health check: http://localhost:3001/health"
echo.
echo 2. 프론트엔드 서버 터미널에서 다음 메시지 확인:
echo    ✅ "Local: http://localhost:3000"
echo    ✅ "ready in" 메시지
echo.
echo 3. 에러 메시지가 있다면 전체 내용을 확인해주세요!
echo ==========================================

pause
