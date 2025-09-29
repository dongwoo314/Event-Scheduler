@echo off
chcp 65001 > nul
echo 🚀 AWS Amplify 배포 준비 스크립트
echo ================================

:: 1. Git 상태 확인
echo.
echo [1/6] Git 상태 확인 중...
if exist .git (
    echo ✓ Git 레포지토리 확인됨
) else (
    echo ✗ Git 레포지토리가 아닙니다. git init을 실행하세요.
    pause
    exit /b 1
)

:: 2. 프론트엔드 의존성 확인
echo.
echo [2/6] 프론트엔드 의존성 확인 중...
cd src\frontend
if exist node_modules (
    echo ✓ 프론트엔드 의존성 확인됨
) else (
    echo 의존성 설치 중...
    call npm install
)

:: 3. 프론트엔드 빌드 테스트
echo.
echo [3/6] 프론트엔드 빌드 테스트 중...
call npm run build
if %errorlevel% equ 0 (
    echo ✓ 프론트엔드 빌드 성공
) else (
    echo ✗ 프론트엔드 빌드 실패
    cd ..\..
    pause
    exit /b 1
)

:: 4. 백엔드 의존성 확인
echo.
echo [4/6] 백엔드 의존성 확인 중...
cd ..\backend
if exist node_modules (
    echo ✓ 백엔드 의존성 확인됨
) else (
    echo 의존성 설치 중...
    call npm install
)

:: 5. 필수 파일 확인
echo.
echo [5/6] 필수 파일 확인 중...
cd ..\..
set MISSING=0

if not exist "amplify.yml" (
    echo ✗ amplify.yml 파일이 없습니다
    set MISSING=1
)

if not exist "src\backend\Dockerfile" (
    echo ✗ src\backend\Dockerfile 파일이 없습니다
    set MISSING=1
)

if %MISSING% equ 0 (
    echo ✓ 모든 필수 파일이 존재합니다
) else (
    echo.
    echo ✗ 일부 필수 파일이 누락되었습니다
    pause
    exit /b 1
)

:: 6. Git 커밋 상태 확인
echo.
echo [6/6] Git 커밋 상태 확인 중...
git status --short > nul 2>&1
if %errorlevel% equ 0 (
    git status --short > temp_status.txt
    for %%A in (temp_status.txt) do set size=%%~zA
    del temp_status.txt
    
    if !size! equ 0 (
        echo ✓ 모든 변경사항이 커밋되었습니다
    ) else (
        echo ⚠ 커밋되지 않은 변경사항이 있습니다
        git status --short
        echo.
        set /p commit_choice="변경사항을 커밋하시겠습니까? (y/n): "
        if /i "!commit_choice!"=="y" (
            git add .
            set /p commit_message="커밋 메시지를 입력하세요: "
            git commit -m "!commit_message!"
            echo ✓ 변경사항이 커밋되었습니다
        )
    )
)

:: 완료 메시지
echo.
echo ================================
echo ✓ 배포 준비 완료!
echo ================================
echo.
echo 다음 단계:
echo 1. GitHub에 푸시: git push origin main
echo 2. AWS Amplify Console에서 앱 생성
echo 3. DEPLOYMENT_GUIDE.md 파일을 참고하여 배포 진행
echo.
echo 자세한 가이드: DEPLOYMENT_GUIDE.md
echo.
pause
