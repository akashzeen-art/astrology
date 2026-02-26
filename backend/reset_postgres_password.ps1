# Run this script as Administrator to reset PostgreSQL password
# Right-click PowerShell -> Run as Administrator -> Run this script

Write-Host "=== PostgreSQL Password Reset Script ===" -ForegroundColor Cyan

# Step 1: Stop PostgreSQL service
Write-Host "`n[1/5] Stopping PostgreSQL service..." -ForegroundColor Yellow
Stop-Service postgresql-x64-18 -Force
Start-Sleep -Seconds 2

# Step 2: Backup pg_hba.conf
Write-Host "[2/5] Backing up pg_hba.conf..." -ForegroundColor Yellow
$pgHbaPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
Copy-Item $pgHbaPath "$pgHbaPath.backup" -Force

# Step 3: Temporarily allow trust authentication
Write-Host "[3/5] Enabling trust authentication..." -ForegroundColor Yellow
$content = Get-Content $pgHbaPath
$newContent = $content -replace 'scram-sha-256', 'trust'
$newContent | Set-Content $pgHbaPath -Force

# Step 4: Start PostgreSQL
Write-Host "[4/5] Starting PostgreSQL..." -ForegroundColor Yellow
Start-Service postgresql-x64-18
Start-Sleep -Seconds 3

# Step 5: Reset password
Write-Host "[5/5] Resetting postgres password to '@Kashsharma1'..." -ForegroundColor Yellow
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD '@Kashsharma1';"

# Step 6: Create database
Write-Host "`nCreating palmastro_db database..." -ForegroundColor Yellow
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE palmastro_db;"

# Step 7: Restore original pg_hba.conf
Write-Host "`nRestoring secure authentication..." -ForegroundColor Yellow
Copy-Item "$pgHbaPath.backup" $pgHbaPath -Force

# Step 8: Restart PostgreSQL
Write-Host "Restarting PostgreSQL..." -ForegroundColor Yellow
Restart-Service postgresql-x64-18
Start-Sleep -Seconds 3

Write-Host "`n=== Done! ===" -ForegroundColor Green
Write-Host "PostgreSQL password is now: @Kashsharma1"
Write-Host "Database 'palmastro_db' has been created"
Write-Host "`nYou can now run:" -ForegroundColor Cyan
Write-Host "  cd C:\Users\Lenovo\Desktop\Projects-Main-Zeen\astrology-new\backend"
Write-Host "  python manage.py migrate"
Write-Host "  python manage.py runserver 8000"

