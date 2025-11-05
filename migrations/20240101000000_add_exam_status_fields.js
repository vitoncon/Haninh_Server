/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('exam_results', function(table) {
    // Thêm các trường quản lý trạng thái và duyệt bài kiểm tra
    table.enum('status', ['draft', 'active', 'completed', 'cancelled'])
          .defaultTo('draft')
          .comment('Trạng thái bài kiểm tra');
    
    table.integer('approved_by')
          .nullable()
          .comment('ID admin đã duyệt');
    
    table.timestamp('approved_at')
          .nullable()
          .comment('Thời gian duyệt');
    
    table.string('approved_by_name', 255)
          .nullable()
          .comment('Tên admin đã duyệt');
    
    table.integer('class_id')
          .unsigned()
          .nullable()
          .comment('ID lớp học');
    
    // Thêm các index để tối ưu performance
    table.index('status', 'idx_exam_results_status');
    table.index('class_id', 'idx_exam_results_class_id');
    table.index('approved_by', 'idx_exam_results_approved_by');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('exam_results', function(table) {
    // Xóa các index trước
    table.dropIndex('status', 'idx_exam_results_status');
    table.dropIndex('class_id', 'idx_exam_results_class_id');
    table.dropIndex('approved_by', 'idx_exam_results_approved_by');
    
    // Xóa các cột đã thêm
    table.dropColumn('status');
    table.dropColumn('approved_by');
    table.dropColumn('approved_at');
    table.dropColumn('approved_by_name');
    table.dropColumn('class_id');
  });
};

