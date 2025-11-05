# Script PowerShell để chạy migration cho exam_results table
# Usage: .\run_exam_migration.ps1

Write-Host "🚀 Bắt đầu chạy migration cho exam_results table..." -ForegroundColor Green

# Kiểm tra xem có đang ở đúng thư mục không
if (-not (Test-Path "knexfile.js")) {
    Write-Host "❌ Không tìm thấy knexfile.js. Vui lòng chạy script từ thư mục Haninh_Server" -ForegroundColor Red
    exit 1
}

# Kiểm tra xem có file migration không
if (-not (Test-Path "migrations/20240101000000_add_exam_status_fields.js")) {
    Write-Host "❌ Không tìm thấy migration file. Vui lòng kiểm tra lại." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Danh sách migration sẽ chạy:" -ForegroundColor Yellow
Write-Host "1. 20240101000000_add_exam_status_fields.js - Thêm các trường status, approved_by, etc." -ForegroundColor Cyan
Write-Host "2. 20240101000001_update_exam_data.js - Cập nhật dữ liệu hiện tại" -ForegroundColor Cyan

# Hỏi xác nhận
$confirm = Read-Host "Bạn có muốn tiếp tục? (y/N)"
if ($confirm -notmatch "^[Yy]$") {
    Write-Host "❌ Hủy bỏ migration" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Đang chạy migration..." -ForegroundColor Yellow

# Chạy migration
try {
    npx knex migrate:latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migration thành công!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Các trường đã được thêm vào exam_results:" -ForegroundColor Cyan
        Write-Host "   - status: ENUM('draft', 'active', 'completed', 'cancelled')" -ForegroundColor White
        Write-Host "   - approved_by: INT(11) NULL" -ForegroundColor White
        Write-Host "   - approved_at: TIMESTAMP NULL" -ForegroundColor White
        Write-Host "   - approved_by_name: VARCHAR(255) NULL" -ForegroundColor White
        Write-Host "   - class_id: INT(10) UNSIGNED NULL" -ForegroundColor White
        Write-Host ""
        Write-Host "🎯 Dữ liệu đã được cập nhật:" -ForegroundColor Cyan
        Write-Host "   - Các bài kiểm tra có điểm: status = 'completed'" -ForegroundColor White
        Write-Host "   - Các bài kiểm tra chưa có điểm: status = 'active'" -ForegroundColor White
        Write-Host "   - class_id đã được cập nhật từ exam_skills" -ForegroundColor White
        Write-Host ""
        Write-Host "🚀 Bây giờ bạn có thể sử dụng ExamService để quản lý exam_results!" -ForegroundColor Green
    } else {
        throw "Migration failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host "❌ Migration thất bại!" -ForegroundColor Red
    Write-Host "💡 Kiểm tra log để xem lỗi chi tiết" -ForegroundColor Yellow
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

