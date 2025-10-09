/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('student_certificates', function(table) {
        table.increments('id').primary();
        
        // Foreign keys
        table.integer('student_id').unsigned().notNullable();
        table.foreign('student_id').references('id').inTable('students').onDelete('CASCADE');
        
        table.integer('certificate_id').unsigned().notNullable();
        table.foreign('certificate_id').references('id').inTable('certificates').onDelete('CASCADE');
        
        table.integer('class_id').unsigned().nullable();
        table.foreign('class_id').references('id').inTable('classes').onDelete('SET NULL');
        
        // Certificate issuance information
        table.date('issued_date').notNullable().comment('Ngày cấp chứng chỉ');
        table.date('expiry_date').nullable().comment('Ngày hết hạn');
        table.string('certificate_number', 100).notNullable().unique().comment('Số chứng chỉ');
        
        // Certificate status
        table.enum('status', ['Đã cấp', 'Đã thu hồi', 'Đã hết hạn', 'Đang chờ'])
             .defaultTo('Đã cấp')
             .comment('Trạng thái chứng chỉ');
        
        // Additional information
        table.text('note').nullable().comment('Ghi chú');
        table.string('issued_by', 255).nullable().comment('Người cấp');
        table.string('signature', 255).nullable().comment('Chữ ký');
        
        // File path for certificate PDF/image
        table.string('certificate_file_path', 500).nullable().comment('Đường dẫn file chứng chỉ');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Unique constraint to prevent duplicate certificates for same student and certificate type
        table.unique(['student_id', 'certificate_id', 'class_id']);
        
        // Indexes
        table.index(['student_id']);
        table.index(['certificate_id']);
        table.index(['class_id']);
        table.index(['status']);
        table.index(['issued_date']);
        table.index(['certificate_number']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('student_certificates');
};
