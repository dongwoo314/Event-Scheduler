@echo off
chcp 65001 >nul
echo ========================================
echo Git Status Diagnosis
echo ========================================

cd /d "C:\Users\김동우\Desktop\schedule-app-project"

echo.
echo [1] Current directory:
echo %cd%

echo.
echo [2] Git status:
git status

echo.
echo [3] Files in staging area:
git diff --cached --name-only

echo.
echo [4] Files that changed:
git diff --name-only

echo.
echo [5] All tracked files:
git ls-files

echo.
echo [6] Remote repository info:
git remote -v

echo.
echo [7] Recent commits:
git log --oneline -5

echo.
echo [8] Current branch:
git branch

echo.
echo [9] Check if source files exist:
echo Backend files:
dir src\backend\*.js /s /b 2>nul | findstr /v node_modules | findstr /v ".git"
echo.
echo Frontend files:
dir src\frontend\src\*.tsx /s /b 2>nul | findstr /v node_modules | findstr /v ".git"

echo.
echo ========================================
echo Diagnosis Complete
echo ========================================
pause