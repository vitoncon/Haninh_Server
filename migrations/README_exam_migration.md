# Migration cho Exam Results Table

## 📋 Mô tả

Migration này sẽ thêm các trường cần thiết vào bảng `exam_results` để hỗ trợ quản lý trạng thái và duyệt bài kiểm tra.

## 🗂️ Files được tạo

1. **20240101000000_add_exam_status_fields.js** - Thêm các trường mới
2. **20240101000001_update_exam_data.js** - Cập nhật dữ liệu hiện tại
3. **run_exam_migration.sh** - Script bash để chạy migration
4. **run_exam_migration.ps1** - Script PowerShell để chạy migration

## 📊 Các trường được thêm

```sql
-- Thêm vào bảng exam_results
status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft'
approved_by INT(11) NULL
approved_at TIMESTAMP NULL  
approved_by_name VARCHAR(255) NULL
class_id INT(10) UNSIGNED NULL

-- Thêm index
idx_exam_results_status
idx_exam_results_class_id
idx_exam_results_approved_by
```

## 🚀 Cách chạy migration

### Trên Linux/Mac:
```bash
cd Haninh_Server
chmod +x run_exam_migration.sh
./run_exam_migration.sh
```

### Trên Windows:
```powershell
cd Haninh_Server
.\run_exam_migration.ps1
```

### Chạy thủ công:
```bash
cd Haninh_Server
npx knex migrate:latest
```

## 📈 Dữ liệu được cập nhật

- **status = 'completed'**: Các bài kiểm tra đã có điểm số
- **status = 'active'**: Các bài kiểm tra đã tạo nhưng chưa có điểm
- **class_id**: Được cập nhật từ exam_skills table

## 🔄 Rollback (nếu cần)

```bash
npx knex migrate:rollback
```

## ✅ Kiểm tra kết quả

Sau khi chạy migration, kiểm tra:

```sql
-- Xem cấu trúc bảng
DESCRIBE exam_results;

-- Xem dữ liệu mẫu
SELECT id, exam_name, status, approved_by, class_id 
FROM exam_results 
LIMIT 5;

-- Xem thống kê status
SELECT status, COUNT(*) as count 
FROM exam_results 
GROUP BY status;
```

## 🎯 Sau khi migration

1. **ExamService** sẽ hoạt động với các API endpoints mới
2. **exam-detail component** sẽ sử dụng ExamService thay vì StudyResultService
3. **Admin** có thể duyệt/mở khóa bài kiểm tra
4. **Giảng viên** có thể import Excel và chỉnh sửa điểm

## ⚠️ Lưu ý

- Backup database trước khi chạy migration
- Kiểm tra kết nối database
- Đảm bảo không có process nào đang sử dụng bảng exam_results
- Test trên môi trường development trước khi chạy production

