#!/bin/bash
# 또는 PowerShell로도 사용 가능
# Schedule App Project 초기화 스크립트

echo "스케줄 앱 프로젝트 초기화 중..."

# Git 초기화 (이미 되어있지 않다면)
if [ ! -d ".git" ]; then
    echo "Git repository 초기화..."
    git init
    git branch -M main
fi

# .gitignore 생성
cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*

# Production builds
/dist
/build

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

# OS
.DS_Store
Thumbs.db

# AWS
.aws/

# Temporary files
*.tmp
*.temp
EOF

echo "프로젝트 구조가 성공적으로 초기화되었습니다!"
echo "다음 단계:"
echo "1. GitHub repository를 생성하고 remote를 추가하세요"
echo "2. AWS 자격 증명을 설정하세요"
echo "3. auto-sync.ps1 스크립트를 실행하여 동기화를 테스트하세요"
