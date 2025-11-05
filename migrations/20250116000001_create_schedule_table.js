/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('schedule', function(table) {
        table.increments('id').primary();
        
        // Foreign key to classes table
        table.integer('class_id').unsigned().notNullable();
        table.foreign('class_id').references('id').inTable('classes').onDelete('CASCADE');
        
        // Foreign key to teachers table
        table.integer('teacher_id').unsigned().nullable();
        table.foreign('teacher_id').references('id').inTable('teachers').onDelete('SET NULL');
        
        // Schedule details
        table.tinyint('day_of_week').notNullable().comment('Thứ trong tuần (1 = Thứ 2, ... 7 = CN)');
        table.time('start_time').notNullable().comment('Giờ bắt đầu');
        table.time('end_time').notNullable().comment('Giờ kết thúc');
        table.date('start_date').notNullable().comment('Ngày bắt đầu áp dụng lịch');
        table.date('end_date').notNullable().comment('Ngày kết thúc lịch');
        table.string('room_name', 100).nullable().comment('Tên phòng học (nhập tay)');
        table.string('note', 255).nullable().comment('Ghi chú (VD: "Khóa IELTS 4 tháng")');
        
        // Status of the schedule
        table.enum('status', ['Đã Lên Lịch', 'Đã Dạy', 'Đã Hủy', 'Dời Lịch'])
             .defaultTo('Đã Lên Lịch')
             .comment('Trạng thái lịch định kỳ');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Indexes for better performance
        table.index(['class_id', 'day_of_week']);
        table.index(['teacher_id', 'day_of_week']);
        table.index(['start_date', 'end_date']);
        table.index(['status']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('schedule');
};
