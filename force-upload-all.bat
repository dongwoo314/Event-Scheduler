@echo off
chcp 65001 >nul
echo ========================================
echo Force Push All Source Code to GitHub
echo ========================================

cd /d "C:\Users\김동우\Desktop\schedule-app-project"

echo.
echo [1] Removing git cache (if any)...
git rm -r --cached . 2>nul

echo.
echo [2] Adding ALL files (including source code)...
git add .
git add src/ -f
git add src/backend/ -f
git add src/frontend/ -f

echo.
echo [3] Checking what will be committed:
git diff --cached --name-only

echo.
echo [4] Creating commit...
git commit -m "Complete project upload with all source code - %date% %time%"

echo.
echo [5] Force pushing to GitHub...
git push origin main --force

echo.
echo ========================================
echo COMPLETED! Check your repository:
echo https://github.com/dongwoo314/Event-Scheduler
echo ========================================

echo.
echo Open repository? (Y/N)
set /p open_repo=
if /i "%open_repo%"=="Y" (
    start https://github.com/dongwoo314/Event-Scheduler
)

pause