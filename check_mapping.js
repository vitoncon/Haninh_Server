const knex = require('knex');
const config = require('./knexfile.js');
const db = knex(config.local || config.development || config);

async function check() {
  try {
    const userCount = await db('users').count('id as count');
    console.log('--- USERS COUNT ---');
    console.log(userCount[0].count);

    const studentCount = await db('students').count('id as count');
    console.log('--- STUDENTS COUNT ---');
    console.log(studentCount[0].count);

    const userEmails = await db('users').select('id', 'email').limit(10);
    console.log('--- SAMPLE USERS ---');
    console.log(JSON.stringify(userEmails, null, 2));

    const studentEmails = await db('students').select('id', 'email', 'full_name').limit(10);
    console.log('--- SAMPLE STUDENTS ---');
    console.log(JSON.stringify(studentEmails, null, 2));

    // Check specific user-student mapping
    const mapping = await db('users as u')
      .join('students as s', 'u.email', 's.email')
      .select('u.id as user_id', 's.id as student_id', 'u.email', 's.full_name')
      .limit(10);
    console.log('--- USER-STUDENT MAPPING (By Email) ---');
    console.log(JSON.stringify(mapping, null, 2));


    // Check fees for the first mapped student
    if (mapping.length > 0) {
      const studentId = mapping[0].student_id;
      const fees = await db('fees')
        .join('courses', 'fees.course_id', 'courses.id')
        .select('fees.*', 'courses.course_name')
        .where('fees.student_id', studentId);
      console.log(`--- FEES FOR STUDENT ID ${studentId} ---`);
      console.log(JSON.stringify(fees, null, 2));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await db.destroy();
  }
}

check();
