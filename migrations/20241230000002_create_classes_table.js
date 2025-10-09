/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('classes', function(table) {
        table.increments('id').primary();
        
        // Basic class information
        table.string('class_name', 255).notNullable().comment('Tên lớp học');
        table.string('class_code', 50).notNullable().unique().comment('Mã lớp học');
        table.text('description').nullable().comment('Mô tả lớp học');
        table.text('learning_outcomes').nullable().comment('Chuẩn đầu ra');
        
        // Schedule information
        table.date('start_date').nullable().comment('Ngày bắt đầu');
        table.date('end_date').nullable().comment('Ngày kết thúc');
        table.string('schedule', 255).nullable().comment('Lịch học (VD: Thứ 2,4,6)');
        table.string('room', 100).nullable().comment('Phòng học mặc định');
        
        // Class capacity
        table.integer('max_students').defaultTo(30).comment('Sĩ số tối đa');
        
        // Status
        table.enum('status', ['Mở đăng ký', 'Đang diễn ra', 'Hoàn thành', 'Đã hủy'])
             .defaultTo('Mở đăng ký')
             .comment('Trạng thái lớp học');
        
        // Foreign key to courses table
        table.integer('course_id').unsigned().nullable();
        table.foreign('course_id').references('id').inTable('courses').onDelete('SET NULL');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Indexes
        table.index(['class_code']);
        table.index(['status']);
        table.index(['course_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('classes');
};
