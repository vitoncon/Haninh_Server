/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Backfill due_date for existing fees based on class start_date + 7 days
  // Only update if start_date exists and due_date is null or obviously invalid (1899)
  await knex.raw(`
    UPDATE fees f 
    JOIN classes c ON f.class_id = c.id 
    SET f.due_date = DATE_ADD(c.start_date, INTERVAL 7 DAY) 
    WHERE c.start_date IS NOT NULL 
    AND (f.due_date IS NULL OR f.due_date < '1900-01-01')
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // No easy way to rollback backfilled data without context of previous values
  // but we can set them back to NULL if they were updated
  return Promise.resolve();
};
