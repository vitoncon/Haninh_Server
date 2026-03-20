/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Ensure enrollments table exists with unique constraint
  const hasEnrollments = await knex.schema.hasTable('enrollments');
  if (!hasEnrollments) {
    await knex.schema.createTable('enrollments', function(table) {
      table.increments('id').primary();
      table.integer('student_id').unsigned().notNullable();
      table.integer('course_id').unsigned().notNullable();
      table.string('status').defaultTo('pending');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.unique(['student_id', 'course_id']);
    });
  }

  // 2. Update fees table
  await knex.schema.alterTable('fees', function(table) {
    // Add missing fields safely
    if (!knex.schema.hasColumn('fees', 'payment_note')) {
      table.string('payment_note').nullable();
    }
    if (!knex.schema.hasColumn('fees', 'paid_at')) {
      table.timestamp('paid_at').nullable();
    }
  });

  // 3. Standardize payment_status data
  // Convert Vietnamese values to English
  await knex('fees').where('payment_status', 'da_thanh_toan').update({ payment_status: 'paid' });
  await knex('fees').where('payment_status', 'Đã thanh toán').update({ payment_status: 'paid' });
  await knex('fees').where('payment_status', 'cho_xac_nhan').update({ payment_status: 'pending' });
  await knex('fees').where('payment_status', 'Chờ xác nhận').update({ payment_status: 'pending' });
  await knex('fees').where('payment_status', 'Chưa thanh toán').update({ payment_status: 'unpaid' });
  await knex('fees').where('payment_status', 'chua_dong').update({ payment_status: 'unpaid' });

  // 4. Update payment_status column to strict enum
  // Note: For MySQL/MariaDB, we use raw to ensure enum values are updated correctly
  await knex.raw(`
    ALTER TABLE fees 
    MODIFY COLUMN payment_status ENUM('unpaid', 'pending', 'paid') 
    NOT NULL DEFAULT 'unpaid'
  `);

  // 5. Add indexes to courses
  await knex.schema.alterTable('courses', function(table) {
    table.index(['course_name']);
    table.index(['language']);
  });
};

exports.down = async function(knex) {
  // Revert enum to a more flexible string or old enum if necessary, 
  // but usually migrations moving forward don't need highly specific rollbacks for enums 
  // unless we're restoring Vietnamese values which we want to avoid.
  await knex.schema.alterTable('fees', function(table) {
    table.dropColumn('payment_note');
    table.dropColumn('paid_at');
  });

  await knex.schema.dropTableIfExists('enrollments');

  await knex.schema.alterTable('courses', function(table) {
    table.dropIndex(['course_name']);
    table.dropIndex(['language']);
  });
};
