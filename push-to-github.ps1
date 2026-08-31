#!/usr/bin/env pwsh
# =============================================================================
# push-to-github.ps1
# Initializes git, sets up the remote, and pushes to GitHub.
# Run from the project root: .\push-to-github.ps1
# =============================================================================

$ErrorActionPreference = "Stop"
$REMOTE = "https://github.com/Asutosh-21/AI-Builder-Challange-.git"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Mission Anomaly Copilot — GitHub Push" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Verify git is available ────────────────────────────────────────────────
try {
    $gitVersion = git --version 2>&1
    Write-Host "Using: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: git is not installed or not on PATH." -ForegroundColor Red
    Write-Host "Install Git from https://git-scm.com/download/win then re-run this script." -ForegroundColor Yellow
    exit 1
}

# ── 2. Init repo if needed ────────────────────────────────────────────────────
if (-not (Test-Path ".git")) {
    Write-Host "Initializing new git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
} else {
    Write-Host "Git repo already initialized." -ForegroundColor Green
}

# ── 3. Configure remote ───────────────────────────────────────────────────────
$remotes = git remote 2>&1
if ($remotes -contains "origin") {
    Write-Host "Updating existing origin remote..." -ForegroundColor Yellow
    git remote set-url origin $REMOTE
} else {
    Write-Host "Adding origin remote..." -ForegroundColor Yellow
    git remote add origin $REMOTE
}
Write-Host "Remote: $(git remote get-url origin)" -ForegroundColor Green

# ── 4. Safety check — confirm sensitive files are excluded ────────────────────
Write-Host ""
Write-Host "---- Security Check ----" -ForegroundColor Yellow

$sensitiveFiles = @(
    "backend/.env",
    "frontend/.env.local",
    "mission-anomaly-copilot-plan.md"
)

$willBeCommitted = $false
foreach ($file in $sensitiveFiles) {
    # git check-ignore exits 0 if ignored, 1 if NOT ignored (would be tracked)
    $result = git check-ignore -q $file 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: '$file' is NOT ignored — check .gitignore!" -ForegroundColor Red
        $willBeCommitted = $true
    } else {
        Write-Host "OK: '$file' is properly ignored" -ForegroundColor Green
    }
}

if ($willBeCommitted) {
    Write-Host ""
    Write-Host "ABORTED: Sensitive files would be committed. Fix .gitignore first." -ForegroundColor Red
    exit 1
}

# ── 5. Stage all files ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Staging files..." -ForegroundColor Yellow
git add .

# Show what will be committed
Write-Host ""
Write-Host "---- Files staged for commit ----" -ForegroundColor Cyan
git status --short

# ── 6. Commit ─────────────────────────────────────────────────────────────────
Write-Host ""
$commitMsg = "feat: Mission Anomaly Copilot - IBM Bob AI Builders Challenge

- Full-stack spacecraft telemetry anomaly detection platform
- IBM Granite 3.1 8B Instruct: root cause explainer + mission planner
- IBM Granite Embedding 30M: RAG incident copilot via ChromaDB
- LangGraph 5-node multi-agent pipeline (Detect→RootCause→Risk→Action→HumanReview)
- FastAPI backend: 26 endpoints, SSE telemetry stream, Isolation Forest ML
- Next.js 15 frontend: 13 routes, 3D orbital globe, enterprise UI
- CelesTrak TLE + sgp4 orbit intelligence
- NASA DONKI space weather integration
- Built entirely with IBM Bob"

git commit -m $commitMsg
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing new to commit, or commit failed." -ForegroundColor Yellow
}

# ── 7. Push ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Pushed to GitHub" -ForegroundColor Green
    Write-Host "  $REMOTE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Push failed. You may need to authenticate:" -ForegroundColor Red
    Write-Host "  git config --global user.email 'your@email.com'" -ForegroundColor Yellow
    Write-Host "  git config --global user.name 'Your Name'" -ForegroundColor Yellow
    Write-Host "  Then re-run: git push -u origin main --force" -ForegroundColor Yellow
}
