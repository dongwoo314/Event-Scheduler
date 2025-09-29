@echo off
echo ================================
echo 🧹 데이터베이스 정리 스크립트
echo ================================

cd /d "C:\Users\김동우\Desktop\schedule-app-project\src\backend"

echo 🗑️ 기존 데이터베이스 파일 삭제 중...
if exist database.sqlite (
    del /q database.sqlite
    echo ✅ database.sqlite 삭제 완료
) else (
    echo ℹ️ database.sqlite 파일 없음
)

if exist database.sqlite.backup (
    del /q database.sqlite.backup
    echo ✅ database.sqlite.backup 삭제 완료
) else (
    echo ℹ️ database.sqlite.backup 파일 없음
)

echo.
echo 🔄 새 데이터베이스 초기화 중...
npm run init-db

if errorlevel 1 (
    echo ❌ 데이터베이스 초기화 실패
    echo 💡 수동으로 서버를 시작해보세요: npm run dev
) else (
    echo ✅ 데이터베이스 초기화 성공
    echo 🚀 서버를 시작하세요: npm run dev
)

echo.
pause
