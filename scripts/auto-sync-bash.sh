#!/bin/bash

# Event-Scheduler 자동 동기화 스크립트 (Bash용)
# GitHub Repository: https://github.com/dongwoo314/Event-Scheduler

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

# 커밋 메시지 설정
COMMIT_MESSAGE="${1:-Auto-sync from Claude session}"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MESSAGE_WITH_TIME="$COMMIT_MESSAGE - $TIMESTAMP"

# 프로젝트 디렉토리로 이동
PROJECT_DIR="/c/Users/김동우/Desktop/schedule-app-project"
if [ ! -d "$PROJECT_DIR" ]; then
    PROJECT_DIR="$(pwd)"
fi

cd "$PROJECT_DIR" || {
    error "프로젝트 디렉토리로 이동할 수 없습니다: $PROJECT_DIR"
    exit 1
}

log "=== Event-Scheduler 자동 동기화 시작 ==="
log "디렉토리: $(pwd)"
log "커밋 메시지: $COMMIT_MESSAGE_WITH_TIME"

# Git 상태 확인
log "Git 상태 확인 중..."
if ! git status &> /dev/null; then
    error "Git repository가 초기화되지 않았습니다."
    error "먼저 ./scripts/setup-git.sh를 실행해주세요."
    exit 1
fi

# 변경사항 확인
CHANGES=$(git status --porcelain)
if [ -z "$CHANGES" ]; then
    warning "변경사항이 없습니다. 동기화를 건너뜁니다."
    exit 0
fi

log "감지된 변경사항:"
echo "$CHANGES" | while read -r line; do
    echo "  $line"
done

# Git 작업 시작
log "모든 변경사항 추가 중..."
if git add .; then
    success "파일 추가 완료"
else
    error "파일 추가 실패"
    exit 1
fi

log "커밋 생성 중..."
if git commit -m "$COMMIT_MESSAGE_WITH_TIME"; then
    success "커밋 생성 완료"
else
    error "커밋 생성 실패"
    exit 1
fi

log "GitHub에 푸시 중..."
# Token을 포함한 URL로 푸시
if git push https://dongwoo314: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@github.com/dongwoo314/Event-Scheduler.git main; then
    success "GitHub 푸시 완료"
else
    error "GitHub 푸시 실패"
    warning "인증 문제일 수 있습니다. GitHub 자격 증명을 확인해주세요."
    exit 1
fi

# AWS S3 동기화 (선택사항)
if [ "$2" != "--skip-aws" ] && command -v aws &> /dev/null; then
    log "AWS S3 동기화 중..."
    if [ -n "$AWS_S3_BUCKET" ]; then
        if aws s3 sync . "s3://$AWS_S3_BUCKET/Event-Scheduler/" \
           --exclude ".git/*" \
           --exclude "node_modules/*" \
           --exclude "logs/*"; then
            success "AWS S3 동기화 완료"
        else
            warning "AWS S3 동기화 실패"
        fi
    else
        warning "AWS_S3_BUCKET 환경변수가 설정되지 않았습니다."
        warning "AWS 동기화를 건너뜁니다."
    fi
else
    log "AWS S3 동기화를 건너뜁니다."
fi

success "=== 자동 동기화 완료 ==="
log "Repository: https://github.com/dongwoo314/Event-Scheduler"
log "최근 커밋: $(git log --oneline -1)"

echo ""
echo "사용법:"
echo "  ./scripts/auto-sync-bash.sh                           # 기본 동기화"
echo "  ./scripts/auto-sync-bash.sh \"커스텀 메시지\"            # 커스텀 커밋 메시지"
echo "  ./scripts/auto-sync-bash.sh \"메시지\" --skip-aws       # AWS 건너뛰기"
