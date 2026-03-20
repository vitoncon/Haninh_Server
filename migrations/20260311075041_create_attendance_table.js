/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('attendance', function(table) {
    table.increments('id').primary();
    table.integer('class_id').unsigned().notNullable();
    table.integer('student_id').unsigned().notNullable();
    table.integer('schedule_id').unsigned().nullable(); // Optional, linked to a specific session
    table.date('attendance_date').notNullable();
    table.enum('status', ['present', 'absent', 'late', 'excused']).notNullable().defaultTo('present');

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.integer('created_by').unsigned().nullable();
    table.integer('updated_by').unsigned().nullable();
    table.integer('is_deleted').defaultTo(0);
    table.integer('deleted_by').unsigned().nullable();

    table.unique(['class_id', 'student_id', 'attendance_date']);
    table.index(['class_id', 'attendance_date']);
    table.index('student_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('attendance');
};
