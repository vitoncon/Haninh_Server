/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('exam_results', function(table) {
        table.increments('id').primary();
        
        // Foreign keys
        table.integer('exam_skill_id').unsigned().notNullable();
        table.foreign('exam_skill_id').references('id').inTable('exam_skills').onDelete('CASCADE');
        
        table.integer('student_id').unsigned().notNullable();
        table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
        
        // Score information
        table.decimal('score', 5, 2).notNullable().comment('Điểm số học viên đạt được');
        table.decimal('percentage', 5, 2).notNullable().comment('Phần trăm điểm');
        
        // Level assessment
        table.enum('level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).notNullable().comment('Trình độ đánh giá');
        
        // Comments and feedback
        table.text('teacher_comment').nullable().comment('Nhận xét của giáo viên');
        table.text('student_feedback').nullable().comment('Phản hồi của học viên');
        
        // Additional fields
        table.boolean('is_passed').defaultTo(false).comment('Đã đạt yêu cầu hay chưa (>= 60%)');
        table.decimal('grade_point', 3, 2).nullable().comment('Điểm hệ 4 (để tính GPA)');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Indexes
        table.index(['exam_skill_id']);
        table.index(['student_id']);
        table.index(['level']);
        table.index(['is_passed']);
        table.index(['percentage']);
        
        // Composite indexes for common queries
        table.index(['exam_skill_id', 'student_id']);
        table.index(['student_id', 'level']);
        table.index(['exam_skill_id', 'is_passed']);
        
        // Unique constraint: mỗi học viên chỉ có một kết quả cho mỗi exam_skill
        table.unique(['exam_skill_id', 'student_id'], 'unique_exam_skill_student');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('exam_results');
};




