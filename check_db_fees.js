const knex = require('knex');
const config = require('./knexfile.js');
const db = knex(config.local || config.development || config);

async function check() {
  try {
    const fees = await db('fees').select('id', 'student_id', 'class_id', 'status', 'amount').limit(5);
    console.log('--- SAMPLE FEES ---');
    console.log(JSON.stringify(fees, null, 2));

    const totalUnpaid = await db('fees').where({ status: 'UNPAID' }).count('id as count');
    console.log('--- TOTAL UNPAID ---');
    console.log(totalUnpaid[0].count);

    const totalPaid = await db('fees').where({ status: 'PAID' }).count('id as count');
    console.log('--- TOTAL PAID ---');
    console.log(totalPaid[0].count);

    const classStudentsCount = await db('class_students').count('id as count');
    console.log('--- TOTAL CLASS_STUDENTS ---');
    console.log(classStudentsCount[0].count);

    const feesCount = await db('fees').count('id as count');
    console.log('--- TOTAL FEES ---');
    console.log(feesCount[0].count);

    // Check if some students are in class_students but NOT in fees
    const missing = await db('class_students as cs')
      .leftJoin('fees as f', function() {
        this.on('cs.student_id', '=', 'f.student_id').andOn('cs.class_id', '=', 'f.class_id');
      })
      .whereNull('f.id')
      .count('cs.id as count');
    console.log('--- MISSING FEES RECORDS FOR ENROLLED STUDENTS ---');
    console.log(missing[0].count);

  } catch (err) {
    console.error(err);
  } finally {
    await db.destroy();
  }
}

check();
