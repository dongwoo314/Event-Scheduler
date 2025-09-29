@echo off
echo 🔄 Creating demo data for calendar testing...
echo.

cd /d "%~dp0"

echo 📋 Step 1: Creating demo user...
node create-demo-user.js
echo.

echo 📅 Step 2: Creating demo events...
node create-demo-events.js
echo.

echo ✅ Demo data creation completed!
echo.
echo 🚀 Login information:
echo    Email: demo@snu.ac.kr
echo    Password: password123
echo.
echo 💡 Now you can test the calendar with real events!
echo.
pause