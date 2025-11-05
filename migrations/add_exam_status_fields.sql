-- Migration: Add status and approval fields to exam_results table
-- Date: 2024-01-XX
-- Description: Thêm các trường quản lý trạng thái và duyệt bài kiểm tra

-- Thêm các trường mới vào bảng exam_results
ALTER TABLE exam_results 
ADD COLUMN status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft' COMMENT 'Trạng thái bài kiểm tra',
ADD COLUMN approved_by INT(11) NULL COMMENT 'ID admin đã duyệt',
ADD COLUMN approved_at TIMESTAMP NULL COMMENT 'Thời gian duyệt',
ADD COLUMN approved_by_name VARCHAR(255) NULL COMMENT 'Tên admin đã duyệt',
ADD COLUMN class_id INT(10) UNSIGNED NULL COMMENT 'ID lớp học';

-- Thêm index cho các trường mới để tối ưu performance
CREATE INDEX idx_exam_results_status ON exam_results(status);
CREATE INDEX idx_exam_results_class_id ON exam_results(class_id);
CREATE INDEX idx_exam_results_approved_by ON exam_results(approved_by);

-- Cập nhật dữ liệu hiện tại (nếu có)
-- Set status = 'completed' cho các bài kiểm tra đã có điểm
UPDATE exam_results er
SET status = 'completed'
WHERE EXISTS (
    SELECT 1 FROM study_results sr 
    WHERE sr.exam_skill_id IN (
        SELECT es.id FROM exam_skills es WHERE es.exam_id = er.id
    )
    AND sr.score > 0
);

-- Set status = 'active' cho các bài kiểm tra đã tạo nhưng chưa có điểm
UPDATE exam_results er
SET status = 'active'
WHERE NOT EXISTS (
    SELECT 1 FROM study_results sr 
    WHERE sr.exam_skill_id IN (
        SELECT es.id FROM exam_skills es WHERE es.exam_id = er.id
    )
    AND sr.score > 0
)
AND status = 'draft';

