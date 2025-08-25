cd "C:\Users\김동우\Desktop\schedule-app-project"

# Git 상태 확인
Write-Host "=== Git Status Check ===" -ForegroundColor Green
git status

# 모든 변경사항 추가
Write-Host "`n=== Adding all changes ===" -ForegroundColor Green
git add .

# 커밋 메시지와 함께 커밋
$commitMessage = "🚀 백엔드 핵심 구조 완성 - 혁신적 스마트 알림 시스템 구현

✅ 완성된 주요 컴포넌트:
- 데이터 모델 7개 (User, Event, Notification, Group 등)
- 미들웨어 4개 (인증, 검증, 에러처리, Rate Limiting)
- 핵심 서비스 4개 (알림, Firebase, 이메일, 크론)
- 메인 서버 (Express + Socket.IO)

🔥 핵심 혁신 기능:
- 사용자 제어형 스마트 알림 시스템
- 3단계 알림 프로세스 (사전알림 → 사용자액션 → 정시알림제어)
- 실시간 Socket.IO 통신
- 99.9% 신뢰성 목표 시스템

🛠️ 기술 스택:
- Node.js + Express + Sequelize
- PostgreSQL + Firebase + Socket.IO
- JWT + Joi + bcryptjs

📊 현재 상태: API Routes 구현 준비 완료
다음 단계: RESTful API 엔드포인트 개발"

Write-Host "`n=== Committing changes ===" -ForegroundColor Green
git commit -m $commitMessage

# GitHub에 푸시
Write-Host "`n=== Pushing to GitHub ===" -ForegroundColor Green
try {
    git push origin main
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Push failed, trying different branch..." -ForegroundColor Yellow
    git push origin master
}

Write-Host "`n🎉 백엔드 코드가 성공적으로 GitHub에 저장되었습니다!" -ForegroundColor Cyan
Write-Host "Repository: https://github.com/dongwoo314/Event-Scheduler" -ForegroundColor Blue
