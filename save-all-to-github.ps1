# PowerShell 스크립트로 GitHub에 전체 프로젝트 저장

Write-Host "========================================" -ForegroundColor Green
Write-Host "GitHub 저장소에 모든 변경사항을 저장합니다" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# 현재 디렉토리를 스크립트 위치로 설정
Set-Location $PSScriptRoot

Write-Host "`n1. 현재 Git 상태 확인 중..." -ForegroundColor Yellow
git status

Write-Host "`n2. 모든 파일을 Git에 추가 중..." -ForegroundColor Yellow
git add .

Write-Host "`n3. 변경사항을 커밋 중..." -ForegroundColor Yellow
$commitMessage = "전체 프로젝트 백업 - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMessage

Write-Host "`n4. GitHub로 푸시 중..." -ForegroundColor Yellow
git push origin main

Write-Host "`n5. 원격 저장소 상태 확인..." -ForegroundColor Yellow
git remote -v

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "GitHub 저장 완료!" -ForegroundColor Green
Write-Host "저장소 URL: https://github.com/dongwoo314/Event-Scheduler" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green

Read-Host "`n아무 키나 눌러서 종료하세요..."
