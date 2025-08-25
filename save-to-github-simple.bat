@echo off
chcp 65001 >nul
echo ========================================
echo GitHub Project Save Started
echo ========================================

cd /d "C:\Users\김동우\Desktop\schedule-app-project"

echo.
echo [1/6] Checking Git status...
git status

echo.
echo [2/6] Adding all changes...
git add .

echo.
echo [3/6] Creating commit...
set /p commit_message="Enter commit message (press Enter for auto): "
if "%commit_message%"=="" (
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do set mytime=%%a:%%b
    set commit_message=Project update - !mydate! !mytime!
)
git commit -m "%commit_message%"

echo.
echo [4/6] Checking remote repository...
git remote -v

echo.
echo [5/6] Pushing to GitHub...
git push origin main

echo.
echo [6/6] Upload completed!
echo ========================================
echo SUCCESS: Project saved to GitHub!
echo Repository: https://github.com/dongwoo314/Event-Scheduler
echo ========================================

echo.
echo Open repository in browser? (Y/N)
set /p open_browser=
if /i "%open_browser%"=="Y" (
    start https://github.com/dongwoo314/Event-Scheduler
)

pause