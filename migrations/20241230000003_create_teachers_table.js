/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('teachers', function(table) {
        table.increments('id').primary();
        
        // Basic teacher information
        table.string('teacher_code', 50).notNullable().unique().comment('Mã giáo viên');
        table.string('teacher_name', 255).notNullable().comment('Tên giáo viên');
        table.enum('gender', ['Nam', 'Nữ', 'Khác']).nullable().comment('Giới tính');
        table.date('dob').nullable().comment('Ngày sinh');
        table.string('phone', 20).nullable().comment('Số điện thoại');
        table.string('email', 255).nullable().comment('Email');
        table.text('address').nullable().comment('Địa chỉ');
        
        // Professional information
        table.string('department', 255).nullable().comment('Khoa/Bộ môn');
        table.text('specialization').nullable().comment('Chuyên môn');
        table.integer('experience_years').defaultTo(0).comment('Số năm kinh nghiệm');
        table.enum('degree', ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ', 'Khác']).nullable().comment('Học vị');
        
        // Status
        table.enum('status', ['Đang dạy', 'Tạm nghỉ', 'Đã nghỉ'])
             .defaultTo('Đang dạy')
             .comment('Trạng thái');
        
        // Additional notes
        table.text('note').nullable().comment('Ghi chú');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Indexes
        table.index(['teacher_code']);
        table.index(['status']);
        table.index(['department']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('teachers');
};
