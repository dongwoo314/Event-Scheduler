# Event Scheduler 서버 연결 상태 진단
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "🔍 Event Scheduler 서버 연결 상태 진단" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# 포트 사용 현황 확인
Write-Host "📡 포트 사용 현황 확인..." -ForegroundColor Yellow
Write-Host ""

Write-Host "🔍 포트 3001 (백엔드) 상태:" -ForegroundColor White
$backend_port = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($backend_port) {
    Write-Host "✅ 포트 3001이 사용 중입니다!" -ForegroundColor Green
    $backend_port | Format-Table LocalAddress, LocalPort, State, OwningProcess -AutoSize
} else {
    Write-Host "❌ 포트 3001이 사용되지 않고 있습니다!" -ForegroundColor Red
    Write-Host "   백엔드 서버가 실행되지 않았을 가능성이 높습니다." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 포트 3000 (프론트엔드) 상태:" -ForegroundColor White
$frontend_port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($frontend_port) {
    Write-Host "✅ 포트 3000이 사용 중입니다!" -ForegroundColor Green
    $frontend_port | Format-Table LocalAddress, LocalPort, State, OwningProcess -AutoSize
} else {
    Write-Host "❌ 포트 3000이 사용되지 않고 있습니다!" -ForegroundColor Red
    Write-Host "   프론트엔드 서버가 실행되지 않았을 가능성이 높습니다." -ForegroundColor Yellow
}

Write-Host ""

# Node.js 프로세스 확인
Write-Host "🔍 Node.js 프로세스 확인..." -ForegroundColor Yellow
$node_processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($node_processes) {
    Write-Host "✅ 실행 중인 Node.js 프로세스:" -ForegroundColor Green
    $node_processes | Format-Table Id, ProcessName, CPU, WorkingSet -AutoSize
} else {
    Write-Host "❌ 실행 중인 Node.js 프로세스가 없습니다!" -ForegroundColor Red
}

Write-Host ""

# 백엔드 Health Check 테스트
Write-Host "🌐 백엔드 Health Check 테스트..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get -TimeoutSec 5
    Write-Host "✅ 백엔드 서버 연결 성공!" -ForegroundColor Green
    Write-Host "📋 응답 데이터:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3 | Write-Host
} catch {
    Write-Host "❌ 백엔드 서버에 연결할 수 없습니다!" -ForegroundColor Red
    Write-Host "📋 오류 내용: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Message -like "*ConnectFailure*" -or $_.Exception.Message -like "*refused*") {
        Write-Host "💡 원인: 백엔드 서버가 실행되지 않았습니다." -ForegroundColor Magenta
    } elseif ($_.Exception.Message -like "*timeout*") {
        Write-Host "💡 원인: 서버 응답 시간 초과 (서버가 느리게 시작 중일 수 있음)" -ForegroundColor Magenta
    }
}

Write-Host ""

# 프론트엔드 접속 테스트
Write-Host "🌐 프론트엔드 접속 테스트..." -ForegroundColor Yellow
try {
    $web_response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ 프론트엔드 서버 연결 성공!" -ForegroundColor Green
    Write-Host "📋 HTTP 상태: $($web_response.StatusCode) $($web_response.StatusDescription)" -ForegroundColor White
} catch {
    Write-Host "❌ 프론트엔드 서버에 연결할 수 없습니다!" -ForegroundColor Red
    Write-Host "📋 오류 내용: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "📋 문제 해결 가이드" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

if (-not $backend_port) {
    Write-Host "🚨 백엔드 서버 문제 해결:" -ForegroundColor Red
    Write-Host "   1. 백엔드 터미널 확인 - 에러 메시지가 있는지 확인" -ForegroundColor White
    Write-Host "   2. 수동 실행: cd C:\Users\김동우\Desktop\schedule-app-project\src\backend" -ForegroundColor White
    Write-Host "   3. npm run dev 실행 후 'Server running successfully!' 메시지 확인" -ForegroundColor White
    Write-Host ""
}

if (-not $frontend_port) {
    Write-Host "🚨 프론트엔드 서버 문제 해결:" -ForegroundColor Red
    Write-Host "   1. 프론트엔드 터미널 확인 - 컴파일 에러가 있는지 확인" -ForegroundColor White
    Write-Host "   2. 수동 실행: cd C:\Users\김동우\Desktop\schedule-app-project\src\frontend" -ForegroundColor White
    Write-Host "   3. npm run dev 실행 후 'Local: http://localhost:3000' 메시지 확인" -ForegroundColor White
    Write-Host ""
}

Write-Host "💡 다음 단계 권장사항:" -ForegroundColor Green
Write-Host "   1. 현재 실행 중인 모든 터미널에서 Ctrl+C로 서버 중지" -ForegroundColor White
Write-Host "   2. 새 터미널에서 수동으로 백엔드 먼저 실행" -ForegroundColor White
Write-Host "   3. 백엔드가 완전히 시작된 후 프론트엔드 실행" -ForegroundColor White
Write-Host "   4. 각 터미널의 에러 메시지를 자세히 확인" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
