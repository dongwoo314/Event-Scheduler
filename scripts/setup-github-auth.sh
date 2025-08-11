#!/bin/bash

# GitHub Personal Access Token 설정 가이드

echo "=== GitHub Personal Access Token 설정 ==="
echo ""
echo "GitHub에서 Personal Access Token을 생성해야 합니다."
echo ""
echo "📋 단계별 가이드:"
echo "1. https://github.com 로그인"
echo "2. Profile → Settings → Developer settings"
echo "3. Personal access tokens → Tokens (classic)"
echo "4. Generate new token (classic)"
echo ""
echo "⚙️  Token 설정:"
echo "   - Note: Event-Scheduler-Project"
echo "   - Expiration: 90 days"
echo "   - Scopes: ✅ repo, ✅ workflow"
echo ""
echo "🔐 인증 정보:"
echo "   - Username: dongwoo314"
echo "   - Password: [생성한 Personal Access Token]"
echo ""

read -p "Personal Access Token을 생성하셨나요? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    echo ""
    echo "Git 인증 정보를 설정합니다..."
    
    # Git credential helper 설정
    git config --global credential.helper 'cache --timeout=3600'
    echo "✓ Git credential cache 설정 완료 (1시간 유지)"
    
    echo ""
    echo "이제 ./scripts/setup-git.sh를 다시 실행하세요."
    echo "인증 창이 나타나면:"
    echo "  Username: dongwoo314"
    echo "  Password: [Personal Access Token 붙여넣기]"
    
else
    echo ""
    echo "먼저 GitHub에서 Personal Access Token을 생성해주세요."
    echo "생성 후 이 스크립트를 다시 실행하세요."
fi

echo ""
echo "🔗 도움이 되는 링크:"
echo "   GitHub Token 생성: https://github.com/settings/tokens"
echo "   문서: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token"
