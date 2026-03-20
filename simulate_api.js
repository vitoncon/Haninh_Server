const knex = require('knex');
const config = require('./knexfile.js');
const db = knex(config.local || config.development || config);

async function check() {
  try {
    const userId = 3; // hvviet@gmail.com
    console.log(`--- SIMULATING API FOR USER ID ${userId} ---`);

    const user = await db('users').where({ id: userId }).first();
    console.log('User from DB:', user.email);

    const student = await db('students').where({ email: user.email, is_deleted: 0 }).first();
    console.log('Student found:', student ? student.full_name : 'NOT FOUND');

    if (student) {
      const studentId = student.id;
      console.log('Querying fees for studentId:', studentId);

      const fees = await db('fees')
        .join('courses', 'fees.course_id', 'courses.id')
        .select(
            'fees.*',
            'courses.course_name as course_name',
            'courses.course_code'
        )
        .where({
            'fees.student_id': studentId,
            'fees.is_deleted': 0,
            'courses.is_deleted': 0
        });

      console.log('API RESPONSE DATA:', JSON.stringify(fees, null, 2));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await db.destroy();
  }
}

check();
