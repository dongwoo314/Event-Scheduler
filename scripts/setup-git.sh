#!/bin/bash

# Event-Scheduler Git 자동 설정 스크립트
# GitHub Repository: https://github.com/dongwoo314/Event-Scheduler

echo "=== Event-Scheduler Git 자동 설정 시작 ==="
echo ""

# 현재 디렉토리 확인
echo "현재 디렉토리: $(pwd)"
echo ""

# Git 설정 확인
echo "Git 사용자 설정 확인 중..."
if ! git config --global user.name > /dev/null 2>&1; then
    echo "Git 사용자명을 설정해주세요:"
    read -p "이름 입력: " username
    git config --global user.name "$username"
fi

if ! git config --global user.email > /dev/null 2>&1; then
    echo "Git 이메일을 설정해주세요:"
    read -p "이메일 입력: " useremail
    git config --global user.email "$useremail"
fi

echo "Git 사용자: $(git config --global user.name)"
echo "Git 이메일: $(git config --global user.email)"
echo ""

# Git 초기화
echo "Git repository 초기화 중..."
if [ ! -d ".git" ]; then
    git init
    echo "✓ Git repository 초기화 완료"
else
    echo "✓ Git repository가 이미 존재합니다"
fi

# 메인 브랜치 설정
echo "메인 브랜치를 'main'으로 설정 중..."
git branch -M main
echo "✓ 메인 브랜치 설정 완료"

# Remote repository 추가
echo "GitHub remote repository 추가 중..."
git remote remove origin 2>/dev/null  # 기존 origin이 있다면 제거
git remote add origin https://github.com/dongwoo314/Event-Scheduler.git
echo "✓ Remote repository 추가 완료"

# 파일 상태 확인
echo ""
echo "현재 파일 상태:"
ls -la

# 스테이징
echo ""
echo "모든 파일을 Git에 추가 중..."
git add .
echo "✓ 파일 추가 완료"

# 커밋 상태 확인
echo ""
echo "커밋할 파일들:"
git status --short

# 첫 번째 커밋
echo ""
echo "초기 커밋 생성 중..."
if git commit -m "Initial commit: Event-Scheduler project setup with auto-sync"; then
    echo "✓ 커밋 생성 완료"
else
    echo "❌ 커밋 실패 - 변경사항이 없거나 오류 발생"
    exit 1
fi

# GitHub에 푸시
echo ""
echo "GitHub에 푸시 중..."
if git push -u origin main; then
    echo "✓ GitHub 푸시 완료"
    echo ""
    echo "🎉 Git 설정이 모두 완료되었습니다!"
    echo "📁 Repository: https://github.com/dongwoo314/Event-Scheduler"
else
    echo "❌ 푸시 실패"
    echo "GitHub 인증이 필요할 수 있습니다."
    echo ""
    echo "해결 방법:"
    echo "1. GitHub Personal Access Token 생성"
    echo "2. Username: dongwoo314"
    echo "3. Password: (Personal Access Token 입력)"
    exit 1
fi

echo ""
echo "=== 다음 단계 ==="
echo "1. 자동 동기화 테스트:"
echo "   ./scripts/auto-sync-bash.sh"
echo ""
echo "2. 새 파일 생성 후 동기화:"
echo "   echo 'test' > test.txt"
echo "   ./scripts/auto-sync-bash.sh"
