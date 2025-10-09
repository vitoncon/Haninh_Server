/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('class_students', function(table) {
        table.increments('id').primary();
        
        // Foreign keys
        table.integer('class_id').unsigned().notNullable();
        table.foreign('class_id').references('id').inTable('classes').onDelete('CASCADE');
        
        table.integer('student_id').unsigned().notNullable();
        table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
        
        // Enrollment information
        table.date('enroll_date').notNullable().comment('Ngày ghi danh');
        table.enum('status', ['Đang học', 'Hoàn thành', 'Nghỉ học'])
             .defaultTo('Đang học')
             .comment('Trạng thái học tập');
        
        // Academic information
        table.decimal('final_score', 5, 2).nullable().comment('Điểm tổng kết');
        table.text('note').nullable().comment('Ghi chú');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Unique constraint to prevent duplicate enrollments
        table.unique(['class_id', 'student_id']);
        
        // Indexes
        table.index(['class_id']);
        table.index(['student_id']);
        table.index(['status']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('class_students');
};
