#!/bin/bash

# 전체 프로젝트를 GitHub에 저장하는 스크립트

echo "========================================"
echo "Event-Scheduler 프로젝트 GitHub 저장"
echo "========================================"

# 스크립트 위치로 이동
cd "$(dirname "$0")"

echo "현재 디렉토리: $(pwd)"
echo

# 1. Git 상태 확인
echo "1. 현재 Git 상태 확인..."
git status
echo

# 2. 병합 충돌 해결 (있다면)
if git status | grep -q "both modified\|both added"; then
    echo "2. 병합 충돌 감지됨. 해결 중..."
    # README.md 충돌 해결
    git add README.md
    echo "README.md 충돌 해결됨"
fi

# 3. 모든 파일 추가
echo "3. 모든 파일을 Git에 추가 중..."
git add .
echo

# 4. 변경사항 커밋
echo "4. 변경사항을 커밋 중..."
COMMIT_MESSAGE="전체 프로젝트 백업 및 정리 - $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MESSAGE"
echo

# 5. 원격 저장소로 푸시
echo "5. GitHub로 푸시 중..."
git push origin main
echo

# 6. 결과 확인
echo "6. 저장 결과 확인..."
echo "원격 저장소 정보:"
git remote -v
echo
echo "최근 커밋:"
git log --oneline -5
echo

echo "========================================"
echo "GitHub 저장 완료!"
echo "저장소 URL: https://github.com/dongwoo314/Event-Scheduler"
echo "========================================"
