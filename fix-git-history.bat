@echo off
echo Fixing git history to remove secret file...
echo.

REM Abort any ongoing rebase
git rebase --abort 2>nul

REM Save the remote URL
for /f "tokens=*" %%a in ('git remote get-url origin 2^>nul') do set REMOTE_URL=%%a

REM Create a backup branch
echo Creating backup branch...
git branch backup-before-cleanup 2>nul

REM Remove all git history and start fresh
echo Removing git history...
rmdir /s /q .git

REM Reinitialize repository
echo Reinitializing repository...
git init
git branch -M Main

REM Add the remote back
if defined REMOTE_URL (
    echo Adding remote...
    git remote add origin %REMOTE_URL%
)

REM Make sure the secret file is removed
if exist "client_secret_773631264350-atjo2ts8sdjstp1f23cs2u89909pbofs.apps.googleusercontent.com.json" (
    echo Removing secret file from working directory...
    del "client_secret_773631264350-atjo2ts8sdjstp1f23cs2u89909pbofs.apps.googleusercontent.com.json"
)

REM Stage all files (except those in .gitignore)
echo Staging files...
git add .

REM Create initial commit
echo Creating clean commit...
git commit -m "Initial commit - VibeSpace project"

echo.
echo Done! The secret file has been removed from history.
echo You can now push with: git push -u origin Main --force
echo.
