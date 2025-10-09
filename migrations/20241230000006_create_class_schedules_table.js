/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('class_schedules', function(table) {
        table.increments('id').primary();
        
        // Foreign key to classes table
        table.integer('class_id').unsigned().notNullable();
        table.foreign('class_id').references('id').inTable('classes').onDelete('CASCADE');
        
        // Foreign key to teachers table (teacher/lecturer)
        table.integer('teacher_id').unsigned().nullable();
        table.foreign('teacher_id').references('id').inTable('teachers').onDelete('SET NULL');
        
        // Schedule details
        table.date('date').notNullable().comment('Ngày học');
        table.time('start_time').notNullable().comment('Giờ bắt đầu');
        table.time('end_time').notNullable().comment('Giờ kết thúc');
        table.string('room', 100).nullable().comment('Phòng học');
        
        // Status of the class session
        table.enum('status', ['Chưa học', 'Đã học', 'Dạy bù', 'Hủy', 'Nghỉ'])
             .defaultTo('Chưa học')
             .comment('Trạng thái buổi học');
        
        // Additional notes
        table.text('note').nullable().comment('Ghi chú');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Indexes for better performance
        table.index(['class_id', 'date']);
        table.index(['teacher_id', 'date']);
        table.index(['date', 'start_time']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('class_schedules');
};
