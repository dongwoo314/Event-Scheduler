#!/bin/bash

echo "=========================================="
echo "🔍 Event Scheduler 서버 연결 상태 진단"
echo "=========================================="
echo ""

# 색상 설정
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📡 포트 사용 현황 확인...${NC}"
echo ""

echo -e "${BLUE}🔍 포트 3001 (백엔드) 상태:${NC}"
if netstat -an | grep -q ":3001"; then
    echo -e "${GREEN}✅ 포트 3001이 사용 중입니다!${NC}"
    netstat -an | grep ":3001"
else
    echo -e "${RED}❌ 포트 3001이 사용되지 않고 있습니다!${NC}"
    echo -e "${YELLOW}   백엔드 서버가 실행되지 않았을 가능성이 높습니다.${NC}"
fi

echo ""
echo -e "${BLUE}🔍 포트 3000 (프론트엔드) 상태:${NC}"
if netstat -an | grep -q ":3000"; then
    echo -e "${GREEN}✅ 포트 3000이 사용 중입니다!${NC}"
    netstat -an | grep ":3000"
else
    echo -e "${RED}❌ 포트 3000이 사용되지 않고 있습니다!${NC}"
    echo -e "${YELLOW}   프론트엔드 서버가 실행되지 않았을 가능성이 높습니다.${NC}"
fi

echo ""

# Node.js 프로세스 확인
echo -e "${YELLOW}🔍 Node.js 프로세스 확인...${NC}"
if tasklist | grep -q "node.exe"; then
    echo -e "${GREEN}✅ 실행 중인 Node.js 프로세스:${NC}"
    tasklist | grep "node.exe" | head -10
else
    echo -e "${RED}❌ 실행 중인 Node.js 프로세스가 없습니다!${NC}"
fi

echo ""

# 백엔드 Health Check 테스트
echo -e "${YELLOW}🌐 백엔드 Health Check 테스트...${NC}"
if curl -s -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 백엔드 서버 연결 성공!${NC}"
    echo -e "${BLUE}📋 응답 데이터:${NC}"
    curl -s http://localhost:3001/health | jq . 2>/dev/null || curl -s http://localhost:3001/health
else
    echo -e "${RED}❌ 백엔드 서버에 연결할 수 없습니다!${NC}"
    echo -e "${YELLOW}💡 원인: 백엔드 서버가 실행되지 않았거나 시작 중 오류 발생${NC}"
fi

echo ""

# 프론트엔드 접속 테스트
echo -e "${YELLOW}🌐 프론트엔드 접속 테스트...${NC}"
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 프론트엔드 서버 연결 성공!${NC}"
else
    echo -e "${RED}❌ 프론트엔드 서버에 연결할 수 없습니다!${NC}"
    echo -e "${YELLOW}💡 원인: 프론트엔드 서버가 실행되지 않았거나 컴파일 오류${NC}"
fi

echo ""
echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}📋 문제 해결 가이드${NC}"
echo -e "${BLUE}===========================================${NC}"

# 포트가 사용되지 않는 경우 해결책 제시
if ! netstat -an | grep -q ":3001"; then
    echo -e "${RED}🚨 백엔드 서버 문제 해결:${NC}"
    echo -e "   ${NC}1. 백엔드 터미널 확인 - 에러 메시지가 있는지 확인${NC}"
    echo -e "   ${NC}2. 수동 실행: cd /c/Users/김동우/Desktop/schedule-app-project/src/backend${NC}"
    echo -e "   ${NC}3. npm run dev 실행 후 'Server running successfully!' 메시지 확인${NC}"
    echo ""
fi

if ! netstat -an | grep -q ":3000"; then
    echo -e "${RED}🚨 프론트엔드 서버 문제 해결:${NC}"
    echo -e "   ${NC}1. 프론트엔드 터미널 확인 - 컴파일 에러가 있는지 확인${NC}"
    echo -e "   ${NC}2. 수동 실행: cd /c/Users/김동우/Desktop/schedule-app-project/src/frontend${NC}"
    echo -e "   ${NC}3. npm run dev 실행 후 'Local: http://localhost:3000' 메시지 확인${NC}"
    echo ""
fi

echo -e "${GREEN}💡 다음 단계 권장사항:${NC}"
echo -e "   ${NC}1. 현재 실행 중인 모든 터미널에서 Ctrl+C로 서버 중지${NC}"
echo -e "   ${NC}2. 새 Git Bash 터미널에서 백엔드 먼저 실행${NC}"
echo -e "   ${NC}3. 백엔드가 완전히 시작된 후 프론트엔드 실행${NC}"
echo -e "   ${NC}4. 각 터미널의 에러 메시지를 자세히 확인${NC}"

echo ""
echo -e "${YELLOW}Press Enter to continue...${NC}"
read
