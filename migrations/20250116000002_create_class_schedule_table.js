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
        
        // Foreign key to schedule table (optional reference to periodic schedule)
        table.integer('schedule_id').unsigned().nullable();
        table.foreign('schedule_id').references('id').inTable('schedule').onDelete('SET NULL');
        
        // Specific class session details
        table.date('date').notNullable().comment('Ngày học cụ thể (VD: 2025-10-20)');
        table.tinyint('day_of_week').notNullable().comment('Thứ (0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7)');
        table.time('start_time').notNullable().comment('Giờ bắt đầu');
        table.time('end_time').notNullable().comment('Giờ kết thúc');
        table.integer('teacher_id').unsigned().nullable().comment('Giáo viên dạy hôm đó');
        table.foreign('teacher_id').references('id').inTable('teachers').onDelete('SET NULL');
        table.string('room_name', 100).nullable().comment('Phòng học hôm đó');
        
        // Status of the class session
        table.enum('status', ['Đã Lên Lịch', 'Đã Dạy', 'Đã Hủy', 'Dời Lịch'])
             .defaultTo('Đã Lên Lịch')
             .comment('Trạng thái buổi học');
        
        // Additional notes
        table.string('note', 255).nullable().comment('Ghi chú (VD: "Buổi bù do nghỉ lễ")');
        
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
        table.index(['schedule_id']);
        table.index(['status']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('class_schedules');
};
