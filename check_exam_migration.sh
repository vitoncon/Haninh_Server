#!/bin/bash

# Script để kiểm tra kết quả migration exam_results
# Usage: ./check_exam_migration.sh

echo "🔍 Kiểm tra kết quả migration exam_results..."

# Kiểm tra xem có đang ở đúng thư mục không
if [ ! -f "knexfile.js" ]; then
    echo "❌ Không tìm thấy knexfile.js. Vui lòng chạy script từ thư mục Haninh_Server"
    exit 1
fi

echo "📊 Kiểm tra cấu trúc bảng exam_results..."

# Kiểm tra cấu trúc bảng
echo "1. Cấu trúc bảng exam_results:"
npx knex raw "DESCRIBE exam_results" 2>/dev/null || echo "❌ Không thể kết nối database"

echo ""
echo "2. Kiểm tra các trường mới:"
npx knex raw "
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'exam_results' 
AND COLUMN_NAME IN ('status', 'approved_by', 'approved_at', 'approved_by_name', 'class_id')
ORDER BY ORDINAL_POSITION
" 2>/dev/null || echo "❌ Không thể truy vấn thông tin cột"

echo ""
echo "3. Thống kê dữ liệu:"
npx knex raw "
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM exam_results), 2) as percentage
FROM exam_results 
GROUP BY status 
ORDER BY count DESC
" 2>/dev/null || echo "❌ Không thể truy vấn thống kê"

echo ""
echo "4. Kiểm tra index:"
npx knex raw "
SELECT 
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_NAME = 'exam_results' 
AND INDEX_NAME LIKE 'idx_exam_results_%'
ORDER BY INDEX_NAME, SEQ_IN_INDEX
" 2>/dev/null || echo "❌ Không thể truy vấn thông tin index"

echo ""
echo "5. Mẫu dữ liệu:"
npx knex raw "
SELECT 
    id,
    exam_name,
    status,
    approved_by,
    approved_at,
    class_id
FROM exam_results 
ORDER BY id DESC 
LIMIT 5
" 2>/dev/null || echo "❌ Không thể truy vấn dữ liệu mẫu"

echo ""
echo "✅ Kiểm tra hoàn tất!"
echo "💡 Nếu có lỗi, kiểm tra kết nối database và quyền truy cập"

