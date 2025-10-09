/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('courses', function(table) {
        table.increments('id').primary();
        
        // Basic course information
        table.string('course_name', 255).notNullable().comment('Tên khóa học');
        table.string('course_code', 50).notNullable().unique().comment('Mã khóa học');
        table.text('description').nullable().comment('Mô tả khóa học');
        table.text('objectives').nullable().comment('Mục tiêu khóa học');
        table.text('content').nullable().comment('Nội dung khóa học');
        
        // Course duration and pricing
        table.integer('duration_hours').defaultTo(0).comment('Thời lượng (giờ)');
        table.decimal('price', 10, 2).defaultTo(0).comment('Học phí');
        
        // Course status
        table.enum('status', ['Đang mở', 'Tạm dừng', 'Đã đóng'])
             .defaultTo('Đang mở')
             .comment('Trạng thái khóa học');
        
        // Prerequisites
        table.text('prerequisites').nullable().comment('Điều kiện tiên quyết');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Indexes
        table.index(['course_code']);
        table.index(['status']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('courses');
};
