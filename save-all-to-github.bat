@echo off
echo ========================================
echo GitHub 저장소에 모든 변경사항을 저장합니다
echo ========================================

cd /d "%~dp0"

echo.
echo 1. 현재 Git 상태 확인 중...
git status

echo.
echo 2. 모든 파일을 Git에 추가 중...
git add .

echo.
echo 3. 변경사항을 커밋 중...
git commit -m "전체 프로젝트 백업 - %date% %time%"

echo.
echo 4. GitHub로 푸시 중...
git push origin main

echo.
echo 5. 원격 저장소 상태 확인...
git remote -v

echo.
echo ========================================
echo GitHub 저장 완료!
echo 저장소 URL: https://github.com/dongwoo314/Event-Scheduler
echo ========================================

pause
