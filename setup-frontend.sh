#!/bin/bash

echo "========================================"
echo "프론트엔드 개발 환경 설정"
echo "========================================"

# 프론트엔드 디렉토리로 이동
cd "$(dirname "$0")/src/frontend"

echo "현재 디렉토리: $(pwd)"
echo

# 1. Node.js 버전 확인
echo "1. Node.js 버전 확인..."
node --version
npm --version
echo

# 2. 의존성 설치
echo "2. 의존성 설치 중..."
npm install
echo

# 3. 환경 변수 파일 생성
echo "3. 환경 변수 파일 설정..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ".env 파일이 생성되었습니다. 필요한 설정을 수정해주세요."
else
    echo ".env 파일이 이미 존재합니다."
fi
echo

# 4. 타입 체크
echo "4. TypeScript 타입 체크..."
npm run type-check
echo

# 5. 린트 체크
echo "5. ESLint 체크..."
npm run lint
echo

echo "========================================"
echo "프론트엔드 설정 완료!"
echo ""
echo "개발 서버 실행:"
echo "  npm run dev"
echo ""
echo "빌드:"
echo "  npm run build"
echo ""
echo "프리뷰:"
echo "  npm run preview"
echo "========================================"
