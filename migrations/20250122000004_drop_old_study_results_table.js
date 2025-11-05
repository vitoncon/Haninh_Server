/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    // Xóa bảng study_results cũ sau khi đã chuyển dữ liệu sang các bảng mới
    return knex.schema.dropTableIfExists('study_results');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    // Khôi phục lại bảng study_results cũ (chỉ tạo lại cấu trúc, không có dữ liệu)
    return knex.schema.createTable('study_results', function(table) {
        table.increments('id').primary();
        
        // Foreign keys
        table.integer('student_id').unsigned().notNullable();
        table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
        
        table.integer('class_id').unsigned().notNullable();
        table.foreign('class_id').references('id').inTable('classes').onDelete('CASCADE');
        
        // Exam information
        table.string('exam_type', 100).notNullable().comment('Loại kiểm tra (Kiểm tra định kỳ, Kiểm tra giữa kỳ, etc.)');
        table.string('exam_name', 255).notNullable().comment('Tên bài kiểm tra');
        table.date('exam_date').notNullable().comment('Ngày thi');
        
        // Language and skill information
        table.enum('language', ['Tiếng Anh', 'Tiếng Hàn', 'Tiếng Trung']).notNullable().comment('Ngôn ngữ');
        table.enum('skill_type', ['Nghe', 'Nói', 'Đọc', 'Viết', 'Tổng hợp']).notNullable().comment('Kỹ năng');
        
        // Score information
        table.decimal('score', 5, 2).notNullable().comment('Điểm số');
        table.decimal('max_score', 5, 2).notNullable().defaultTo(100).comment('Điểm tối đa');
        table.decimal('percentage', 5, 2).notNullable().comment('Phần trăm điểm');
        
        // Level assessment
        table.enum('level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).notNullable().comment('Trình độ đánh giá');
        
        // Comments and feedback
        table.text('teacher_comment').nullable().comment('Nhận xét của giáo viên');
        table.text('student_feedback').nullable().comment('Phản hồi của học viên');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Indexes
        table.index(['student_id']);
        table.index(['class_id']);
        table.index(['exam_date']);
        table.index(['language']);
        table.index(['skill_type']);
        table.index(['level']);
        table.index(['exam_type']);
        
        // Composite indexes for common queries
        table.index(['student_id', 'class_id']);
        table.index(['class_id', 'exam_date']);
        table.index(['student_id', 'language']);
    });
};




