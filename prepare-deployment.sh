#!/bin/bash

echo "🚀 AWS Amplify 배포 준비 스크립트"
echo "================================"

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Git 상태 확인
echo -e "\n${YELLOW}[1/6] Git 상태 확인 중...${NC}"
if [ -d .git ]; then
    echo -e "${GREEN}✓ Git 레포지토리 확인됨${NC}"
else
    echo -e "${RED}✗ Git 레포지토리가 아닙니다. git init을 실행하세요.${NC}"
    exit 1
fi

# 2. 프론트엔드 의존성 확인
echo -e "\n${YELLOW}[2/6] 프론트엔드 의존성 확인 중...${NC}"
cd src/frontend
if [ -d node_modules ]; then
    echo -e "${GREEN}✓ 프론트엔드 의존성 확인됨${NC}"
else
    echo -e "${YELLOW}의존성 설치 중...${NC}"
    npm install
fi

# 3. 프론트엔드 빌드 테스트
echo -e "\n${YELLOW}[3/6] 프론트엔드 빌드 테스트 중...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 프론트엔드 빌드 성공${NC}"
else
    echo -e "${RED}✗ 프론트엔드 빌드 실패${NC}"
    exit 1
fi

# 4. 백엔드 의존성 확인
echo -e "\n${YELLOW}[4/6] 백엔드 의존성 확인 중...${NC}"
cd ../backend
if [ -d node_modules ]; then
    echo -e "${GREEN}✓ 백엔드 의존성 확인됨${NC}"
else
    echo -e "${YELLOW}의존성 설치 중...${NC}"
    npm install
fi

# 5. 필수 파일 확인
echo -e "\n${YELLOW}[5/6] 필수 파일 확인 중...${NC}"
cd ../..
MISSING_FILES=()

if [ ! -f "amplify.yml" ]; then
    MISSING_FILES+=("amplify.yml")
fi

if [ ! -f "src/backend/Dockerfile" ]; then
    MISSING_FILES+=("src/backend/Dockerfile")
fi

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ 모든 필수 파일이 존재합니다${NC}"
else
    echo -e "${RED}✗ 다음 파일들이 누락되었습니다:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo -e "${RED}  - $file${NC}"
    done
    exit 1
fi

# 6. Git 커밋 상태 확인
echo -e "\n${YELLOW}[6/6] Git 커밋 상태 확인 중...${NC}"
if [[ -z $(git status -s) ]]; then
    echo -e "${GREEN}✓ 모든 변경사항이 커밋되었습니다${NC}"
else
    echo -e "${YELLOW}⚠ 커밋되지 않은 변경사항이 있습니다:${NC}"
    git status -s
    echo -e "\n${YELLOW}변경사항을 커밋하시겠습니까? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git add .
        echo -e "${YELLOW}커밋 메시지를 입력하세요:${NC}"
        read -r commit_message
        git commit -m "$commit_message"
        echo -e "${GREEN}✓ 변경사항이 커밋되었습니다${NC}"
    fi
fi

# 완료 메시지
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ 배포 준비 완료!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "\n다음 단계:"
echo -e "1. GitHub에 푸시: ${YELLOW}git push origin main${NC}"
echo -e "2. AWS Amplify Console에서 앱 생성"
echo -e "3. DEPLOYMENT_GUIDE.md 파일을 참고하여 배포 진행"
echo -e "\n자세한 가이드: ${YELLOW}DEPLOYMENT_GUIDE.md${NC}"
