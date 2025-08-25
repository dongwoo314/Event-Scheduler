@echo off
cd /d "C:\Users\김동우\Desktop\schedule-app-project"

echo Adding all files...
git add .

echo Creating commit...
git commit -m "Project update"

echo Pushing to GitHub...
git push origin main

echo.
echo Done! Check: https://github.com/dongwoo314/Event-Scheduler
pause