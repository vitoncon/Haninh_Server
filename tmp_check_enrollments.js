const knex = require('knex');
const config = require('./knexfile');
const db = knex(config.local);

async function checkEnrollments() {
  const columns = await db('enrollments').columnInfo();
  console.log('Enrollments columns info:', columns);
  process.exit(0);
}

checkEnrollments().catch(err => {
  console.error(err);
  process.exit(1);
});
