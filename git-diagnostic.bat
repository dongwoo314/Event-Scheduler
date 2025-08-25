@echo off
echo Git Status Diagnostic
echo ====================

cd /d "C:\Users\김동우\Desktop\schedule-app-project"

echo Current directory:
cd

echo.
echo Git version check:
git --version

echo.
echo Git status:
git status

echo.
echo Git config check:
git config --list

echo.
echo Remote repository:
git remote -v

echo.
echo Last commits:
git log --oneline -5

echo.
echo Staged files:
git diff --cached --name-only

echo.
echo Modified files:
git diff --name-only

pause