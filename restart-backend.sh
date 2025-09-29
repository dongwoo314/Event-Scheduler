#!/bin/bash

# 색상 설정
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}🔄 Node.js 프로세스 정리 및 서버 재시작${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

echo -e "${YELLOW}🛑 현재 실행 중인 Node.js 프로세스를 모두 종료합니다...${NC}"
taskkill //IM node.exe //F > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Node.js 프로세스가 종료되었습니다.${NC}"
else
    echo -e "${YELLOW}⚠️  실행 중인 Node.js 프로세스가 없습니다.${NC}"
fi

echo ""
echo -e "${YELLOW}🧹 포트 정리 중...${NC}"
sleep 2

echo -e "${GREEN}✅ 정리 완료!${NC}"
echo ""
echo -e "${CYAN}🚀 이제 서버를 수동으로 시작합니다...${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

echo -e "${BLUE}📋 단계별 실행 가이드:${NC}"
echo ""
echo -e "${YELLOW}1️⃣ 첫 번째 Git Bash 터미널 (백엔드):${NC}"
echo -e "   ${NC}cd /c/Users/김동우/Desktop/schedule-app-project/src/backend${NC}"
echo -e "   ${NC}npm run dev${NC}"
echo ""
echo -e "${YELLOW}2️⃣ 두 번째 Git Bash 터미널 (프론트엔드):${NC}"
echo -e "   ${NC}cd /c/Users/김동우/Desktop/schedule-app-project/src/frontend${NC}"
echo -e "   ${NC}npm run dev${NC}"
echo ""
echo -e "${RED}⚠️  중요: 백엔드가 완전히 시작된 후 프론트엔드를 시작하세요!${NC}"
echo -e "${RED}⚠️  각 터미널에서 에러 메시지가 나오는지 주의깊게 확인하세요!${NC}"
echo ""

read -p "Press Enter to continue and start backend server..."

echo ""
echo -e "${YELLOW}🔄 자동으로 백엔드 서버를 시작합니다...${NC}"
echo -e "${BLUE}📂 백엔드 디렉토리로 이동 중...${NC}"

cd /c/Users/김동우/Desktop/schedule-app-project/src/backend

echo -e "${BLUE}📍 현재 위치: $(pwd)${NC}"
echo ""

echo -e "${YELLOW}🗄️  데이터베이스 상태 확인...${NC}"
if [ -f database.sqlite ]; then
    echo -e "${GREEN}✅ SQLite 데이터베이스 존재${NC}"
    ls -la database.sqlite
else
    echo -e "${YELLOW}⚠️  데이터베이스가 없습니다. 초기화를 실행합니다...${NC}"
    node init-db.js
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 데이터베이스 초기화 실패!${NC}"
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}🚀 백엔드 서버 시작...${NC}"
echo -e "${BLUE}📡 포트 3001에서 서버가 시작됩니다...${NC}"
echo ""
echo -e "${YELLOW}👀 다음 메시지들을 확인하세요:${NC}"
echo -e "   ${GREEN}✅ \"Server running successfully!\"${NC}"
echo -e "   ${GREEN}✅ \"Port: 3001\"${NC}"
echo -e "   ${GREEN}✅ \"Health check: http://localhost:3001/health\"${NC}"
echo ""
echo -e "${RED}🔴 에러가 발생하면 Ctrl+C로 중지하고 에러 내용을 확인하세요!${NC}"
echo ""

# package.json 확인
if [ ! -f package.json ]; then
    echo -e "${RED}❌ package.json이 없습니다!${NC}"
    read -p "Press Enter to exit..."
    exit 1
fi

# node_modules 확인
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}⚠️  node_modules가 없습니다. npm install을 실행합니다...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ npm install 실패!${NC}"
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

# 서버 시작
npm run dev
