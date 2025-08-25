#!/bin/bash

# 스케줄 관리 서비스 백엔드 설정 스크립트

echo "🚀 스케줄 관리 서비스 백엔드 설정을 시작합니다..."

# 백엔드 디렉토리로 이동
cd "$(dirname "$0")/src/backend"

echo "📦 패키지 설치 중..."

# npm 패키지 설치
npm install

echo "⚙️ 환경 설정 파일 생성 중..."

# .env 파일이 없으면 .env.example을 복사
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ .env 파일이 생성되었습니다. 필요한 환경 변수를 설정해주세요."
else
    echo "⚠️  .env 파일이 이미 존재합니다."
fi

echo "🗃️  데이터베이스 설정 안내:"
echo "   1. PostgreSQL이 설치되어 있는지 확인하세요."
echo "   2. .env 파일에서 데이터베이스 연결 정보를 설정하세요."
echo "   3. 다음 명령어로 데이터베이스를 생성하세요:"
echo "      createdb schedule_app_dev"
echo ""
echo "🔑 JWT 시크릿 키 생성 안내:"
echo "   .env 파일에서 JWT_SECRET과 JWT_REFRESH_SECRET을 강력한 키로 변경하세요."
echo ""
echo "🚀 서버 실행 방법:"
echo "   개발 서버: npm run dev"
echo "   프로덕션 서버: npm start"
echo ""
echo "✅ 백엔드 설정이 완료되었습니다!"
echo "   다음 단계: .env 파일을 편집하고 데이터베이스를 설정한 후 서버를 실행하세요."
