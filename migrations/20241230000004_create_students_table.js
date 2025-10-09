/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('students', function(table) {
        table.increments('id').primary();
        
        // Basic student information
        table.string('student_code', 50).notNullable().unique().comment('Mã học viên');
        table.string('full_name', 255).notNullable().comment('Họ và tên');
        table.enum('gender', ['Nam', 'Nữ', 'Khác']).nullable().comment('Giới tính');
        table.date('dob').nullable().comment('Ngày sinh');
        table.string('phone', 20).nullable().comment('Số điện thoại');
        table.string('email', 255).nullable().comment('Email');
        table.text('address').nullable().comment('Địa chỉ');
        
        // Academic information
        table.string('school', 255).nullable().comment('Trường học');
        table.string('major', 255).nullable().comment('Chuyên ngành');
        table.integer('academic_year').nullable().comment('Năm học');
        
        // Status
        table.enum('status', ['Đang học', 'Tạm dừng', 'Tốt nghiệp', 'Nghỉ học'])
             .defaultTo('Đang học')
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
        table.index(['student_code']);
        table.index(['status']);
        table.index(['school']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('students');
};
