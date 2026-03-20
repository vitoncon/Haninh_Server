/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Add new columns
  await knex.schema.alterTable('fees', table => {
    table.enum('status', ['UNPAID', 'PENDING', 'PAID']).notNullable().defaultTo('UNPAID').comment('Trạng thái thanh toán mới');
    table.enum('new_payment_method', ['CASH', 'BANKING', 'QR']).nullable().comment('Phương thức TT mới');
  });

  // 2. Map data
  await knex('fees').update({
    status: knex.raw(`CASE 
       WHEN payment_status = 'Đã thanh toán' THEN 'PAID'
       WHEN is_payment_submitted = 1 THEN 'PENDING'
       ELSE 'UNPAID'
       END`),
    new_payment_method: knex.raw(`CASE
       WHEN payment_method = 'Tiền mặt' THEN 'CASH'
       WHEN payment_method = 'Ví điện tử' THEN 'QR'
       ELSE 'BANKING'
       END`)
  });

  // 3. Drop old columns
  await knex.schema.alterTable('fees', table => {
    table.dropColumn('payment_status');
    table.dropColumn('is_payment_submitted');
    table.dropColumn('payment_method');
  });

  // 4. Rename column
  await knex.schema.alterTable('fees', table => {
    table.renameColumn('new_payment_method', 'payment_method');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Add old columns back
  await knex.schema.alterTable('fees', table => {
    table.enum('payment_status', ['Chưa thanh toán', 'Đã thanh toán', 'Quá hạn', 'Hoàn trả']).notNullable().defaultTo('Chưa thanh toán');
    table.boolean('is_payment_submitted').defaultTo(false);
    table.enum('old_payment_method', ['Tiền mặt', 'Chuyển khoản', 'Thẻ tín dụng', 'Ví điện tử']).nullable();
  });

  // Revert mapped data
  await knex('fees').update({
    payment_status: knex.raw(`CASE 
       WHEN status = 'PAID' THEN 'Đã thanh toán'
       ELSE 'Chưa thanh toán'
       END`),
    is_payment_submitted: knex.raw(`CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END`),
    old_payment_method: knex.raw(`CASE
       WHEN payment_method = 'CASH' THEN 'Tiền mặt'
       WHEN payment_method = 'QR' THEN 'Ví điện tử'
       ELSE 'Chuyển khoản'
       END`)
  });

  // Drop new columns
  await knex.schema.alterTable('fees', table => {
    table.dropColumn('status');
    table.dropColumn('payment_method');
  });

  // Rename column
  await knex.schema.alterTable('fees', table => {
    table.renameColumn('old_payment_method', 'payment_method');
  });
};
