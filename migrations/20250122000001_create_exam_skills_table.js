/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('exam_skills', function(table) {
        table.increments('id').primary();
        
        // Foreign keys
        table.integer('exam_id').unsigned().notNullable();
        table.foreign('exam_id').references('id').inTable('exams').onDelete('CASCADE');
        
        // Skill information
        table.enum('skill_type', ['Nghe', 'Nói', 'Đọc', 'Viết', 'Tổng hợp']).notNullable().comment('Kỹ năng');
        table.decimal('max_score', 5, 2).notNullable().comment('Điểm tối đa cho kỹ năng này');
        table.decimal('weight', 3, 2).defaultTo(1.00).comment('Trọng số của kỹ năng (để tính điểm tổng)');
        
        // Additional skill details
        table.text('description').nullable().comment('Mô tả kỹ năng');
        table.integer('order_index').defaultTo(0).comment('Thứ tự hiển thị kỹ năng');
        
        // Statistics (tự động tính)
        table.decimal('average_score', 5, 2).nullable().comment('Điểm trung bình của kỹ năng này');
        table.integer('total_students').defaultTo(0).comment('Số học viên đã thi kỹ năng này');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Indexes
        table.index(['exam_id']);
        table.index(['skill_type']);
        table.index(['order_index']);
        
        // Composite indexes
        table.index(['exam_id', 'skill_type']);
        table.index(['exam_id', 'order_index']);
        
        // Unique constraint: mỗi exam chỉ có một skill_type duy nhất
        table.unique(['exam_id', 'skill_type'], 'unique_exam_skill');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('exam_skills');
};




