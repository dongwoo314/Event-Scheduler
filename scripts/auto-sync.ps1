# Schedule App Project Auto-Sync Script
# 작성자: 서울대학교 컴퓨터공학과
# 목적: Claude 작업 내용을 GitHub와 AWS에 자동 동기화

param(
    [string]$CommitMessage = "Auto-sync from Claude session",
    [switch]$SkipAWS = $false
)

$ProjectPath = "C:\Users\김동우\Desktop\schedule-app-project"
$LogFile = "$ProjectPath\logs\sync-log.txt"

# 로그 디렉토리 생성
$LogDir = Split-Path $LogFile -Parent
if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force
}

function Write-Log {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

try {
    Set-Location $ProjectPath
    
    Write-Log "=== Starting Auto-Sync Process ==="
    
    # Git 상태 확인
    Write-Log "Checking Git status..."
    $GitStatus = git status --porcelain
    
    if ($GitStatus) {
        Write-Log "Changes detected. Starting sync process..."
        
        # Git add
        Write-Log "Adding all changes to Git..."
        git add .
        
        # Commit with timestamp
        $CommitMessageWithTime = "$CommitMessage - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Write-Log "Committing changes: $CommitMessageWithTime"
        git commit -m $CommitMessageWithTime
        
        # Push to GitHub
        Write-Log "Pushing to GitHub..."
        git push https://github.com/dongwoo314/Event-Scheduler main
        
        # AWS S3 sync (if not skipped)
        if (-not $SkipAWS) {
            Write-Log "Syncing to AWS S3..."
            aws s3 sync . s3://schedule-app-project-backup/ --exclude ".git/*" --exclude "node_modules/*" --exclude "logs/*"
        }
        
        Write-Log "=== Sync completed successfully ==="
    } else {
        Write-Log "No changes detected. Skipping sync."
    }
    
} catch {
    Write-Log "ERROR: $($_.Exception.Message)"
    exit 1
}
