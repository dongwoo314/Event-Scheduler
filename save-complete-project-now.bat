@echo off
echo ========================================
echo GitHub 프로젝트 저장 시작
echo ========================================

cd /d "C:\Users\김동우\Desktop\schedule-app-project"

echo.
echo [1/6] 현재 Git 상태 확인 중...
git status

echo.
echo [2/6] 모든 변경사항 스테이징 중...
git add .

echo.
echo [3/6] 변경사항 커밋 중...
set /p commit_message="커밋 메시지를 입력하세요 (엔터: 자동 메시지): "
if "%commit_message%"=="" (
    set commit_message=프로젝트 업데이트 - %date% %time%
)
git commit -m "%commit_message%"

echo.
echo [4/6] 원격 저장소 상태 확인 중...
git remote -v

echo.
echo [5/6] GitHub에 업로드 중...
git push -u origin main

echo.
echo [6/6] 업로드 완료!
echo ========================================
echo ✅ 프로젝트가 성공적으로 GitHub에 저장되었습니다!
echo 📍 저장소: https://github.com/dongwoo314/Event-Scheduler
echo ========================================

echo.
echo 브라우저에서 저장소를 열까요? (Y/N)
set /p open_browser=
if /i "%open_browser%"=="Y" (
    start https://github.com/dongwoo314/Event-Scheduler
)

pause