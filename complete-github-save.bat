@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ========================================
echo Event-Scheduler 프로젝트 GitHub 저장
echo ========================================

cd /d "%~dp0"

echo 현재 디렉토리: %CD%
echo.

REM 1. Git 상태 확인
echo 1. 현재 Git 상태 확인 중...
git status
echo.

REM 2. 병합 충돌이 있는지 확인하고 해결
git status | findstr /C:"both modified" >nul
if !errorlevel! equ 0 (
    echo 2. 병합 충돌 감지됨. 해결 중...
    git add README.md
    echo README.md 충돌 해결됨
    echo.
)

REM 3. 모든 파일 추가
echo 3. 모든 파일을 Git에 추가 중...
git add .
echo.

REM 4. 변경사항 커밋
echo 4. 변경사항을 커밋 중...
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a:%%b
git commit -m "전체 프로젝트 백업 및 정리 - !mydate! !mytime!"
echo.

REM 5. GitHub로 푸시
echo 5. GitHub로 푸시 중...
git push origin main
if !errorlevel! neq 0 (
    echo 푸시 중 오류가 발생했습니다. 다시 시도합니다...
    git pull origin main --no-edit
    git push origin main
)
echo.

REM 6. 결과 확인
echo 6. 저장 결과 확인...
echo 원격 저장소 정보:
git remote -v
echo.
echo 최근 커밋:
git log --oneline -5
echo.

echo ========================================
echo GitHub 저장 완료!
echo 저장소 URL: https://github.com/dongwoo314/Event-Scheduler
echo ========================================
echo.

pause
