#!/bin/bash

# Script để chạy migration cho exam_results table
# Usage: ./run_exam_migration.sh

echo "🚀 Bắt đầu chạy migration cho exam_results table..."

# Kiểm tra xem có đang ở đúng thư mục không
if [ ! -f "knexfile.js" ]; then
    echo "❌ Không tìm thấy knexfile.js. Vui lòng chạy script từ thư mục Haninh_Server"
    exit 1
fi

# Kiểm tra xem có file migration không
if [ ! -f "migrations/20240101000000_add_exam_status_fields.js" ]; then
    echo "❌ Không tìm thấy migration file. Vui lòng kiểm tra lại."
    exit 1
fi

echo "📋 Danh sách migration sẽ chạy:"
echo "1. 20240101000000_add_exam_status_fields.js - Thêm các trường status, approved_by, etc."
echo "2. 20240101000001_update_exam_data.js - Cập nhật dữ liệu hiện tại"

# Hỏi xác nhận
read -p "Bạn có muốn tiếp tục? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Hủy bỏ migration"
    exit 1
fi

echo "🔄 Đang chạy migration..."

# Chạy migration
npx knex migrate:latest

if [ $? -eq 0 ]; then
    echo "✅ Migration thành công!"
    echo ""
    echo "📊 Các trường đã được thêm vào exam_results:"
    echo "   - status: ENUM('draft', 'active', 'completed', 'cancelled')"
    echo "   - approved_by: INT(11) NULL"
    echo "   - approved_at: TIMESTAMP NULL"
    echo "   - approved_by_name: VARCHAR(255) NULL"
    echo "   - class_id: INT(10) UNSIGNED NULL"
    echo ""
    echo "🎯 Dữ liệu đã được cập nhật:"
    echo "   - Các bài kiểm tra có điểm: status = 'completed'"
    echo "   - Các bài kiểm tra chưa có điểm: status = 'active'"
    echo "   - class_id đã được cập nhật từ exam_skills"
    echo ""
    echo "🚀 Bây giờ bạn có thể sử dụng ExamService để quản lý exam_results!"
else
    echo "❌ Migration thất bại!"
    echo "💡 Kiểm tra log để xem lỗi chi tiết"
    exit 1
fi

