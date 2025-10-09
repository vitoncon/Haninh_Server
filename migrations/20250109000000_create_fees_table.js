/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('fees', function(table) {
        table.increments('id').primary();
        
        // Foreign keys
        table.integer('student_id').unsigned().notNullable();
        table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
        
        table.integer('class_id').unsigned().notNullable();
        table.foreign('class_id').references('id').inTable('classes').onDelete('CASCADE');
        
        table.integer('course_id').unsigned().notNullable();
        table.foreign('course_id').references('id').inTable('courses').onDelete('CASCADE');
        
        // Fee information
        table.decimal('amount', 12, 2).notNullable().comment('Số tiền');
        table.enum('payment_type', ['Học phí', 'Phí thi', 'Phí tài liệu', 'Phí khác'])
             .notNullable()
             .defaultTo('Học phí')
             .comment('Loại phí');
        table.enum('payment_method', ['Tiền mặt', 'Chuyển khoản', 'Thẻ tín dụng', 'Ví điện tử'])
             .nullable()
             .comment('Phương thức thanh toán');
        table.enum('payment_status', ['Chưa thanh toán', 'Đã thanh toán', 'Quá hạn', 'Hoàn trả'])
             .notNullable()
             .defaultTo('Chưa thanh toán')
             .comment('Trạng thái thanh toán');
        
        // Date information
        table.date('due_date').notNullable().comment('Ngày hạn thanh toán');
        table.date('paid_date').nullable().comment('Ngày thanh toán');
        
        // Payment details
        table.string('receipt_number', 100).nullable().comment('Số hóa đơn');
        table.string('transaction_id', 100).nullable().comment('Mã giao dịch');
        
        // Additional notes
        table.text('notes').nullable().comment('Ghi chú');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Indexes
        table.index(['student_id']);
        table.index(['class_id']);
        table.index(['course_id']);
        table.index(['payment_status']);
        table.index(['due_date']);
        table.index(['paid_date']);
        table.index(['payment_type']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('fees');
};
