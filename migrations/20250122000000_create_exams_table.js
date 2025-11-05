/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('exams', function(table) {
        table.increments('id').primary();
        
        // Foreign keys
        table.integer('class_id').unsigned().notNullable();
        table.foreign('class_id').references('id').inTable('classes').onDelete('CASCADE');
        
        // Exam information
        table.string('exam_name', 255).notNullable().comment('Tên bài kiểm tra');
        table.string('exam_type', 100).notNullable().comment('Loại kiểm tra (Kiểm tra định kỳ, Kiểm tra giữa kỳ, etc.)');
        table.date('exam_date').notNullable().comment('Ngày thi');
        table.enum('language', ['Tiếng Anh', 'Tiếng Hàn', 'Tiếng Trung']).notNullable().comment('Ngôn ngữ');
        
        // Additional exam details
        table.text('description').nullable().comment('Mô tả bài kiểm tra');
        table.decimal('total_max_score', 5, 2).notNullable().defaultTo(100).comment('Tổng điểm tối đa của bài kiểm tra');
        table.decimal('average_score', 5, 2).nullable().comment('Điểm trung bình của bài kiểm tra (tự động tính)');
        table.integer('total_students').defaultTo(0).comment('Tổng số học viên tham gia');
        
        // Status
        table.enum('status', ['draft', 'in_progress', 'review', 'completed', 'cancelled']).defaultTo('draft').comment('Trạng thái bài kiểm tra');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Indexes
        table.index(['class_id']);
        table.index(['exam_date']);
        table.index(['language']);
        table.index(['exam_type']);
        table.index(['status']);
        
        // Composite indexes for common queries
        table.index(['class_id', 'exam_date']);
        table.index(['class_id', 'language']);
        table.index(['exam_date', 'language']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('exams');
};




