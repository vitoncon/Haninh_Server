const knex = require('knex');
const config = require('./knexfile.js');
const db = knex(config.local || config.development || config);

async function check() {
  try {
    const users = await db('users').select('id', 'email');
    console.log('--- ALL USERS ---');
    console.table(users);

    const students = await db('students').select('id', 'email', 'full_name', 'is_deleted');
    console.log('--- ALL STUDENTS ---');
    console.table(students);

    console.log('--- MAPPING REPORT ---');
    for (const user of users) {
      const student = await db('students').where({ email: user.email, is_deleted: 0 }).first();
      if (student) {
        const fees = await db('fees').where({ student_id: student.id, is_deleted: 0 }).count('id as count');
        const unpaid = await db('fees').where({ student_id: student.id, is_deleted: 0, status: 'UNPAID' }).count('id as count');
        console.log(`User ${user.id} (${user.email}) -> Student ${student.id} (${student.full_name}): ${fees[0].count} fees (${unpaid[0].count} UNPAID)`);
      } else {
        console.log(`User ${user.id} (${user.email}) -> NO STUDENT FOUND`);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await db.destroy();
  }
}

check();
