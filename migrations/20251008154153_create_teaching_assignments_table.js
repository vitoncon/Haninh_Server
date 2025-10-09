/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('teaching_assignments', function(table) {
        table.increments('id').primary();
        
        // Foreign keys
        table.integer('teacher_id').unsigned().notNullable();
        table.foreign('teacher_id').references('id').inTable('teachers').onDelete('CASCADE');
        
        table.integer('class_id').unsigned().notNullable();
        table.foreign('class_id').references('id').inTable('classes').onDelete('CASCADE');
        
        // Assignment details
        table.string('subject', 255).notNullable().comment('Môn học');
        table.text('description').nullable().comment('Mô tả phân công');
        
        // Schedule information
        table.string('schedule', 255).nullable().comment('Lịch dạy (VD: Thứ 2,4,6)');
        table.string('room', 100).nullable().comment('Phòng dạy');
        table.time('start_time').nullable().comment('Giờ bắt đầu');
        table.time('end_time').nullable().comment('Giờ kết thúc');
        
        // Assignment status
        table.enum('status', ['Đang dạy', 'Tạm dừng', 'Hoàn thành', 'Đã hủy'])
             .defaultTo('Đang dạy')
             .comment('Trạng thái phân công');
        
        // Assignment period
        table.date('start_date').nullable().comment('Ngày bắt đầu dạy');
        table.date('end_date').nullable().comment('Ngày kết thúc dạy');
        
        // Additional notes
        table.text('notes').nullable().comment('Ghi chú');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Indexes
        table.index(['teacher_id']);
        table.index(['class_id']);
        table.index(['status']);
        table.index(['start_date']);
        
        // Unique constraint to prevent duplicate assignments
        table.unique(['teacher_id', 'class_id', 'subject'], 'unique_teacher_class_subject');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('teaching_assignments');
};