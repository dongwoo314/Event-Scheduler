@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ========================================
echo Event Scheduler 전체 프로젝트 GitHub 저장
echo ========================================

cd /d "%~dp0"

echo 현재 디렉토리: %CD%
echo.

REM 1. Git 상태 확인
echo 1. 현재 Git 상태 확인...
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
git commit -m "프론트엔드 개발 환경 구축 완료 - React + TypeScript + Vite - !mydate! !mytime!"
echo.

REM 5. GitHub로 푸시
echo 5. GitHub로 푸시 중...
git push origin main
if !errorlevel! neq 0 (
    echo 푸시 중 오류가 발생했습니다. pull 후 다시 시도합니다...
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

REM 7. 프로젝트 구조 출력
echo 7. 프로젝트 구조:
echo ├── src/
echo │   ├── backend/          (Node.js + Express + Sequelize)
echo │   └── frontend/         (React + TypeScript + Vite)
echo ├── docs/                 (프로젝트 문서 8개)
echo ├── scripts/              (자동화 스크립트 15개)
echo └── README.md              (프로젝트 설명)
echo.

echo ========================================
echo 프론트엔드 개발 환경 구축 완료!
echo ========================================
echo.
echo 📦 백엔드: Node.js + Express + Sequelize + JWT
echo 🎨 프론트엔드: React + TypeScript + Vite + Tailwind
echo 🗄️ 데이터베이스: PostgreSQL/MySQL + Sequelize ORM
echo 🔔 알림: Firebase + Email + WebSocket
echo 🎭 애니메이션: Framer Motion
echo 📱 반응형: Tailwind CSS
echo 🏪 상태관리: Zustand + React Query
echo.
echo 저장소 URL: https://github.com/dongwoo314/Event-Scheduler
echo.
echo 다음 단계:
echo 1. cd src/frontend
echo 2. npm install
echo 3. npm run dev
echo ========================================

pause
