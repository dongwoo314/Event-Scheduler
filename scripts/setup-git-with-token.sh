#!/bin/bash

# GitHub Personal Access Token을 사용한 자동 Git 설정
TOKEN="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"
USERNAME="dongwoo314"
REPO_URL="https://github.com/dongwoo314/Event-Scheduler.git"

echo "=== Event-Scheduler Git 자동 설정 (Token 포함) ==="
echo ""

# Git 사용자 설정
echo "Git 사용자 설정 중..."
git config --global user.name "dongwoo314"
git config --global user.email "dongwoo314@gmail.com"  # 필요시 수정
echo "✓ Git 사용자 설정 완료"

# Git credential helper 설정
echo "Git credential helper 설정 중..."
git config --global credential.helper 'cache --timeout=3600'
echo "✓ Credential cache 설정 완료"

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

# Remote repository 추가 (Token 포함)
echo "GitHub remote repository 추가 중..."
git remote remove origin 2>/dev/null
git remote add origin "https://$USERNAME:$TOKEN@github.com/dongwoo314/Event-Scheduler.git"
echo "✓ Remote repository 추가 완료"

# 파일 추가
echo "모든 파일을 Git에 추가 중..."
git add .
echo "✓ 파일 추가 완료"

# 커밋
echo "초기 커밋 생성 중..."
if git commit -m "Initial commit: Event-Scheduler project setup with auto-sync"; then
    echo "✓ 커밋 생성 완료"
else
    echo "❌ 커밋 실패 - 변경사항이 없거나 오류 발생"
fi

# GitHub에 푸시
echo "GitHub에 푸시 중..."
if git push -u origin main; then
    echo "✓ GitHub 푸시 완료"
    echo ""
    echo "🎉 Git 설정이 모두 완료되었습니다!"
    echo "📁 Repository: https://github.com/dongwoo314/Event-Scheduler"
else
    echo "❌ 푸시 실패"
fi

echo ""
echo "=== 설정 완료 ==="
