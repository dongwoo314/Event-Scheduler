# 스케줄 프로그램 개발 프로젝트

## 프로젝트 개요
웹과 모바일 앱이 연동되는 스케줄 프로그램 개발 프로젝트입니다.

## 개발 환경
- **개발자**: 서울대학교 컴퓨터공학과
- **AI 어시스턴트**: Claude (Anthropic)
- **버전 관리**: Git & GitHub
- **클라우드**: AWS
- **자동화**: PowerShell Scripts

## 프로젝트 구조
```
schedule-app-project/
├── docs/           # 프로젝트 문서
├── src/            # 소스 코드
├── scripts/        # 자동화 스크립트
├── logs/           # 동기화 로그
└── README.md       # 프로젝트 설명
```

## 자동 동기화 설정

### 사전 요구사항
1. **Git 설정**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@snu.ac.kr"
   ```

2. **GitHub Repository 연결**
   ```bash
   git remote add origin https://github.com/dongwoo314/Event-Scheduler.git
   ```

3. **AWS CLI 설정**
   ```bash
   aws configure
   ```

### 자동 동기화 실행
```powershell
# 기본 동기화
.\scripts\auto-sync.ps1

# 커스텀 커밋 메시지
.\scripts\auto-sync.ps1 -CommitMessage "새로운 기능 추가"

# AWS 동기화 스킵
.\scripts\auto-sync.ps1 -SkipAWS
```

## 개발 워크플로우
1. Claude에서 코드/문서 작성
2. 로컬 파일 시스템에 저장
3. auto-sync 스크립트 실행
4. GitHub와 AWS에 자동 백업

## 다음 단계
- [ ] GitHub Repository 생성
- [ ] AWS S3 버킷 설정
- [ ] 프로젝트 아키텍처 설계
- [ ] 기술 스택 선정
- [ ] 개발 일정 수립

---
*이 프로젝트는 Claude AI와의 협업으로 진행됩니다.*
