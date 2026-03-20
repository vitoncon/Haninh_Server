/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Remove duplicates before applying unique constraint
  // Strategy: Keep the row with the max ID for a given student_id and class_id
  await knex.raw(`
    DELETE f1 FROM fees f1
    JOIN fees f2 
    WHERE f1.id < f2.id 
    AND f1.student_id = f2.student_id 
    AND f1.class_id = f2.class_id
  `);



  // 3. Backfill missing fees for students who are in a class but have no fees record
  await knex.raw(`
    INSERT INTO fees (student_id, course_id, class_id, amount, status, created_at)
    SELECT cs.student_id, cl.course_id, cs.class_id, IFNULL(c.tuition_fee, 0), 'UNPAID', NOW()
    FROM class_students cs
    JOIN classes cl ON cs.class_id = cl.id
    JOIN courses c ON cl.course_id = c.id
    LEFT JOIN fees f ON cs.student_id = f.student_id AND cs.class_id = f.class_id
    WHERE f.id IS NULL AND cl.is_deleted = 0
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Do nothing, the uniqueness is intrinsic.
};
