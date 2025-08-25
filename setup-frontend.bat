@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ========================================
echo 프론트엔드 개발 환경 설정
echo ========================================

REM 프론트엔드 디렉토리로 이동
cd /d "%~dp0\src\frontend"

echo 현재 디렉토리: %CD%
echo.

REM 1. Node.js 버전 확인
echo 1. Node.js 버전 확인...
node --version
npm --version
echo.

REM 2. 의존성 설치
echo 2. 의존성 설치 중...
npm install
if !errorlevel! neq 0 (
    echo 의존성 설치 중 오류가 발생했습니다.
    pause
    exit /b 1
)
echo.

REM 3. 환경 변수 파일 생성
echo 3. 환경 변수 파일 설정...
if not exist ".env" (
    copy ".env.example" ".env"
    echo .env 파일이 생성되었습니다. 필요한 설정을 수정해주세요.
) else (
    echo .env 파일이 이미 존재합니다.
)
echo.

REM 4. 타입 체크
echo 4. TypeScript 타입 체크...
npm run type-check
echo.

REM 5. 린트 체크
echo 5. ESLint 체크...
npm run lint
echo.

echo ========================================
echo 프론트엔드 설정 완료!
echo.
echo 개발 서버 실행:
echo   npm run dev
echo.
echo 빌드:
echo   npm run build
echo.
echo 프리뷰:
echo   npm run preview
echo ========================================
echo.

pause
