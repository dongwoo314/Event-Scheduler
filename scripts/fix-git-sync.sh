#!/bin/bash

# GitHub repository 동기화 해결 스크립트
TOKEN="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"
USERNAME="dongwoo314"
REPO_URL="https://$USERNAME:$TOKEN@github.com/dongwoo314/Event-Scheduler.git"

echo "=== GitHub Repository 동기화 문제 해결 ==="
echo ""

# 현재 상태 확인
echo "현재 Git 상태 확인 중..."
git status

echo ""
echo "원격 저장소 내용을 가져오는 중..."

# 원격 저장소 내용 가져오기 (allow-unrelated-histories 옵션 사용)
if git pull $REPO_URL main --allow-unrelated-histories; then
    echo "✓ 원격 저장소 내용 가져오기 완료"
else
    echo "❌ Pull 실패. 강제 동기화를 시도합니다..."
    
    # 강제 동기화 옵션 제시
    echo ""
    echo "해결 방법을 선택하세요:"
    echo "1. 원격 저장소 내용을 무시하고 강제 푸시 (기존 GitHub 내용 삭제됨)"
    echo "2. 수동으로 병합 충돌 해결"
    echo "3. 새로운 브랜치로 푸시"
    
    read -p "선택 (1-3): " choice
    
    case $choice in
        1)
            echo "강제 푸시를 실행합니다..."
            if git push $REPO_URL main --force; then
                echo "✓ 강제 푸시 완료"
            else
                echo "❌ 강제 푸시 실패"
                exit 1
            fi
            ;;
        2)
            echo "수동 병합을 위해 원격 저장소를 다시 가져옵니다..."
            git fetch $REPO_URL
            git merge origin/main --allow-unrelated-histories
            echo "병합 충돌이 있다면 수동으로 해결한 후 다음 명령어를 실행하세요:"
            echo "  git add ."
            echo "  git commit -m 'Merge remote and local changes'"
            echo "  git push $REPO_URL main"
            exit 0
            ;;
        3)
            echo "새로운 브랜치 'local-setup'으로 푸시합니다..."
            git checkout -b local-setup
            if git push $REPO_URL local-setup; then
                echo "✓ 새 브랜치로 푸시 완료"
                echo "GitHub에서 Pull Request를 생성하여 병합할 수 있습니다."
            else
                echo "❌ 브랜치 푸시 실패"
                exit 1
            fi
            ;;
        *)
            echo "잘못된 선택입니다."
            exit 1
            ;;
    esac
    exit 0
fi

# Pull이 성공했다면 이제 푸시 시도
echo ""
echo "변경사항을 GitHub에 푸시 중..."
if git push $REPO_URL main; then
    echo "✓ GitHub 푸시 완료"
    echo ""
    echo "🎉 동기화 문제가 해결되었습니다!"
    echo "📁 Repository: https://github.com/dongwoo314/Event-Scheduler"
else
    echo "❌ 푸시 실패"
    echo "추가 확인이 필요합니다."
fi

echo ""
echo "=== 최종 상태 확인 ==="
git status
git log --oneline -3
