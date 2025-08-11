# Event-Scheduler Git 설정 스크립트
# GitHub Repository: https://github.com/dongwoo314/Event-Scheduler

echo "Event-Scheduler Git Repository 설정 중..."

# Git 초기화 (이미 되어있지 않다면)
if (!(Test-Path ".git")) {
    Write-Host "Git repository 초기화..."
    git init
    git branch -M main
}

# Remote repository 추가
Write-Host "GitHub remote repository 추가..."
git remote remove origin 2>$null  # 기존 origin이 있다면 제거
git remote add origin https://github.com/dongwoo314/Event-Scheduler.git

# .gitignore 생성
Write-Host ".gitignore 파일 생성..."
@"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
/dist
/build
/.next

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# AWS
.aws/

# Database
*.db
*.sqlite

# Temporary files
*.tmp
*.temp

# Mobile
*.apk
*.ipa
ios/
android/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8

Write-Host "Git 설정이 완료되었습니다!"
Write-Host ""
Write-Host "다음 단계:"
Write-Host "1. 초기 커밋을 생성합니다:"
Write-Host "   git add ."
Write-Host "   git commit -m 'Initial commit: Event-Scheduler project setup'"
Write-Host ""
Write-Host "2. GitHub에 push합니다:"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "3. 또는 auto-sync 스크립트를 실행합니다:"
Write-Host "   .\scripts\auto-sync.ps1 -CommitMessage 'Project initialization'"
