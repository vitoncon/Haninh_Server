/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('otps', function(table) {
        // Sửa đổi trường 'exp' từ kiểu string thành kiểu timestamp
        table.timestamp('exp').alter(); // alter() chỉ ra rằng bạn muốn thay đổi kiểu trường

        // Thêm các trường mới vào bảng
        table.integer('created_by').defaultTo(0); // Trường created_by
        table.integer('updated_by').defaultTo(0); // Trường updated_by
        table.boolean('is_deleted').defaultTo(false); // Trường is_deleted
        table.integer('deleted_by').defaultTo(0); // Trường deleted_by
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('otps', function(table) {
        // Xóa các trường mới nếu rollback
        table.dropColumn('created_by');
        table.dropColumn('updated_by');
        table.dropColumn('is_deleted');
        table.dropColumn('deleted_by');
        
        // Thay đổi lại kiểu trường 'exp' nếu rollback
        table.string('exp').alter(); // Sửa lại kiểu của trường 'exp' nếu rollback
    });
};
