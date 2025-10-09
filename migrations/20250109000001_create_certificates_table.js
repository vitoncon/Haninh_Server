/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('certificates', function(table) {
        table.increments('id').primary();
        
        // Basic certificate information
        table.string('certificate_code', 50).notNullable().unique().comment('Mã chứng chỉ');
        table.string('certificate_name', 255).notNullable().comment('Tên chứng chỉ');
        table.text('description').nullable().comment('Mô tả chứng chỉ');
        table.text('criteria').nullable().comment('Tiêu chí cấp chứng chỉ');
        
        // Certificate validity
        table.integer('validity_period_months').nullable().comment('Thời hạn hiệu lực (tháng)');
        table.boolean('is_permanent').defaultTo(false).comment('Chứng chỉ vĩnh viễn');
        
        // Certificate status
        table.enum('status', ['Hoạt động', 'Tạm dừng', 'Đã hủy'])
             .defaultTo('Hoạt động')
             .comment('Trạng thái chứng chỉ');
        
        // Audit fields
        table.timestamps(true, true);
        table.integer('created_by').defaultTo(0);
        table.integer('updated_by').defaultTo(0);
        table.integer('is_deleted').defaultTo(0);
        table.integer('deleted_by').defaultTo(0);
        
        // Indexes
        table.index(['certificate_code']);
        table.index(['status']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('certificates');
};

