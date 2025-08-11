@echo off
echo Starting auto-sync process...

REM Change to project directory
cd /d "C:\Users\김동우\Desktop\schedule-app-project"

REM Add timestamp to commit message
set timestamp=%date% %time%

REM Git operations
echo Adding all changes to Git...
git add .

echo Committing changes...
git commit -m "Auto-sync: %timestamp%"

echo Pushing to GitHub...
git push https://github.com/dongwoo314/Event-Scheduler main

REM AWS S3 sync (optional)
echo Syncing to AWS S3...
aws s3 sync . s3://your-bucket-name/schedule-app-project/ --exclude ".git/*" --exclude "node_modules/*"

echo Auto-sync completed!
pause
