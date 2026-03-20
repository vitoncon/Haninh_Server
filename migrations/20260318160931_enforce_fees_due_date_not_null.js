/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Backfill due_date with start_date + 7 days
  // Only where start_date is legitimate (> 1900)
  await knex.raw(`
    UPDATE fees f
    JOIN classes c ON f.class_id = c.id
    SET f.due_date = DATE_ADD(c.start_date, INTERVAL 7 DAY)
    WHERE c.start_date IS NOT NULL AND c.start_date > '1900-01-01'
  `);

  // 2. Identify and DELETE fees that cannot have a due_date (missing class start_date)
  // According to strict rule: "No start_date = No fee"
  const invalidFees = await knex('fees as f')
    .leftJoin('classes as c', 'f.class_id', 'c.id')
    .whereNull('c.start_date')
    .orWhere('c.start_date', '<=', '1900-01-01')
    .orWhereNull('f.due_date')
    .select('f.id');

  if (invalidFees.length > 0) {
    console.log(`Deleting ${invalidFees.length} invalid fees with missing/invalid class start_date.`);
    await knex('fees').whereIn('id', invalidFees.map(f => f.id)).delete();
  }

  // 3. Alter table to enforce NOT NULL
  await knex.schema.alterTable('fees', (table) => {
    table.date('due_date').notNullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('fees', (table) => {
    table.date('due_date').nullable().alter();
  });
};
