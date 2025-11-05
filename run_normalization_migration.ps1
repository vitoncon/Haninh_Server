# PowerShell script to run the study results normalization migration
# This script will migrate the study_results table to the new normalized structure

Write-Host "Starting Study Results Normalization Migration..." -ForegroundColor Green

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Please run this script from the Haninh_Server directory" -ForegroundColor Red
    exit 1
}

# Check if npm is available
try {
    $null = Get-Command npm -ErrorAction Stop
} catch {
    Write-Host "Error: npm is not available. Please install Node.js and npm." -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Creating backup of current database..." -ForegroundColor Yellow
Write-Host "⚠️  WARNING: Please ensure you have a backup of your database before proceeding!" -ForegroundColor Red
Write-Host "Press Enter to continue or Ctrl+C to abort..."
Read-Host

Write-Host "Step 2: Running migrations..." -ForegroundColor Yellow

# Run the migrations in order
Write-Host "Creating exams table..." -ForegroundColor Cyan
npx knex migrate:up 20250122000000_create_exams_table.js

Write-Host "Creating exam_skills table..." -ForegroundColor Cyan
npx knex migrate:up 20250122000001_create_exam_skills_table.js

Write-Host "Creating exam_results table..." -ForegroundColor Cyan
npx knex migrate:up 20250122000002_create_exam_results_table.js

Write-Host "Migrating existing data..." -ForegroundColor Cyan
npx knex migrate:up 20250122000003_migrate_study_results_data.js

Write-Host "Creating stored procedures and triggers..." -ForegroundColor Cyan
npx knex migrate:up 20250122000005_create_exam_statistics_procedures.js

Write-Host "Step 3: Verifying migration..." -ForegroundColor Yellow

# Run verification queries
Write-Host "Checking new tables..." -ForegroundColor Cyan
npx knex raw "SELECT table_name FROM information_schema.tables WHERE table_name IN ('exams', 'exam_skills', 'exam_results');"

Write-Host "Checking data counts..." -ForegroundColor Cyan
npx knex raw "SELECT 'exams' as table_name, COUNT(*) as count FROM exams UNION ALL SELECT 'exam_skills', COUNT(*) FROM exam_skills UNION ALL SELECT 'exam_results', COUNT(*) FROM exam_results;"

Write-Host "Step 4: Testing new functionality..." -ForegroundColor Yellow
Write-Host "Testing stored procedure..." -ForegroundColor Cyan
npx knex raw "SELECT * FROM get_student_exam_results_by_skills(1, NULL, NULL) LIMIT 5;"

Write-Host ""
Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your backend API to use the new endpoints"
Write-Host "2. Update your frontend components to use the new service methods"
Write-Host "3. Test the new 4-skill display format"
Write-Host "4. Consider dropping the old study_results table after verification"
Write-Host ""
Write-Host "To drop the old table, run:" -ForegroundColor Yellow
Write-Host "npx knex migrate:up 20250122000004_drop_old_study_results_table.js"
Write-Host ""
Write-Host "Migration completed at: $(Get-Date)" -ForegroundColor Green




