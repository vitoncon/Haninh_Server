/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('class_students', function(table) {
        // Thêm cột completion_date
        table.date('completion_date').nullable().comment('Ngày hoàn thành/nghỉ học');
        
        // Thêm cột note
        table.text('note').nullable().comment('Ghi chú riêng cho lớp học này');
        
        // Thêm index cho completion_date để tối ưu query
        table.index(['completion_date'], 'idx_completion_date');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('class_students', function(table) {
        // Xóa index trước
        table.dropIndex(['completion_date'], 'idx_completion_date');
        
        // Xóa các cột đã thêm
        table.dropColumn('completion_date');
        table.dropColumn('note');
    });
};
