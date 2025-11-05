/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.transaction(async (trx) => {
    // Cập nhật status = 'active' cho tất cả exam_results hiện tại
    // Vì chúng ta chưa có dữ liệu study_results
    await trx('exam_results').update({
      status: 'active'
    });
    
    // Bỏ qua việc cập nhật class_id vì có thể bảng exam_skills chưa có cột này
    console.log('Migration completed: Set all exam_results status to "active"');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.transaction(async (trx) => {
    // Reset status về draft
    await trx('exam_results').update({
      status: 'draft',
      approved_by: null,
      approved_at: null,
      approved_by_name: null
    });
  });
};
