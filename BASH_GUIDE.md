# Bash Scripts 실행 권한 설정 가이드

## 스크립트 실행 권한 부여

Bash에서 다음 명령어를 실행하여 스크립트에 실행 권한을 부여하세요:

```bash
# 프로젝트 디렉토리로 이동
cd "/c/Users/김동우/Desktop/schedule-app-project"

# 실행 권한 부여
chmod +x scripts/setup-git.sh
chmod +x scripts/auto-sync-bash.sh

# 권한 확인
ls -la scripts/
```

## 사용 방법

### 1. Git 초기 설정 (한 번만 실행)
```bash
./scripts/setup-git.sh
```

### 2. 자동 동기화 (매번 사용)
```bash
# 기본 동기화
./scripts/auto-sync-bash.sh

# 커스텀 커밋 메시지
./scripts/auto-sync-bash.sh "새 기능 추가"

# AWS 건너뛰기
./scripts/auto-sync-bash.sh "메시지" --skip-aws
```

## 경로 문제 해결

만약 경로 문제가 있다면:

```bash
# 현재 위치에서 실행
cd ~/Desktop/schedule-app-project
./scripts/setup-git.sh
```

또는:

```bash
# 절대 경로로 실행
bash "/c/Users/김동우/Desktop/schedule-app-project/scripts/setup-git.sh"
```
