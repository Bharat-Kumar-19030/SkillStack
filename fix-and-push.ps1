# Script to fix git history and push to GitHub
Write-Host "=== Fixing Git History and Pushing to GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Save remote URL
Write-Host "Step 1: Saving remote URL..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin
Write-Host "Remote URL: $remoteUrl" -ForegroundColor Green
Write-Host ""

# Step 2: Delete secret file if it exists
Write-Host "Step 2: Removing secret file from working directory..." -ForegroundColor Yellow
$secretFile = "client_secret_773631264350-atjo2ts8sdjstp1f23cs2u89909pbofs.apps.googleusercontent.com.json"
if (Test-Path $secretFile) {
    Remove-Item $secretFile -Force
    Write-Host "Secret file deleted" -ForegroundColor Green
} else {
    Write-Host "Secret file not found (already deleted)" -ForegroundColor Green
}
Write-Host ""

# Step 3: Remove git folder
Write-Host "Step 3: Removing .git folder (cleaning history)..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Remove-Item -Recurse -Force .git
    Write-Host ".git folder removed" -ForegroundColor Green
} else {
    Write-Host ".git folder not found" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Reinitialize git
Write-Host "Step 4: Reinitializing git repository..." -ForegroundColor Yellow
git init
git branch -M Main
Write-Host "Repository reinitialized" -ForegroundColor Green
Write-Host ""

# Step 5: Add remote
Write-Host "Step 5: Adding remote origin..." -ForegroundColor Yellow
git remote add origin $remoteUrl
Write-Host "Remote added: $remoteUrl" -ForegroundColor Green
Write-Host ""

# Step 6: Stage all files (secret file will be ignored via .gitignore)
Write-Host "Step 6: Staging all files..." -ForegroundColor Yellow
git add .
Write-Host "Files staged" -ForegroundColor Green
Write-Host ""

# Step 7: Show what will be committed
Write-Host "Step 7: Files to be committed:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Step 8: Create clean commit
Write-Host "Step 8: Creating clean commit..." -ForegroundColor Yellow
git commit -m "Initial commit - VibeSpace project (cleaned history)"
Write-Host "Commit created" -ForegroundColor Green
Write-Host ""

# Step 9: Force push to GitHub
Write-Host "Step 9: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Using: git push -u origin Main --force" -ForegroundColor Cyan
git push -u origin Main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== SUCCESS! ===" -ForegroundColor Green
    Write-Host "Your code has been pushed to GitHub successfully!" -ForegroundColor Green
    Write-Host "Check your repository at: $remoteUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "=== PUSH FAILED ===" -ForegroundColor Red
    Write-Host "Please check the error message above." -ForegroundColor Red
    Write-Host ""
    Write-Host "If the secret file error still appears, you may need to:" -ForegroundColor Yellow
    Write-Host "1. Use the GitHub link provided to allow the secret push" -ForegroundColor Yellow
    Write-Host "2. Or contact GitHub support to bypass the protection" -ForegroundColor Yellow
}
Write-Host ""
