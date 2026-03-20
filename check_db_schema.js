const knex = require('knex');
const config = require('./knexfile');
const db = knex(config.local);

async function checkSchema() {
  const feesColumns = await db('fees').columnInfo();
  console.log('Fees columns info:', feesColumns);
  
  const coursesColumns = await db('courses').columnInfo();
  console.log('Courses columns info:', coursesColumns);
  
  const tables = await db.raw('SHOW TABLES');
  console.log('Tables:', tables[0].map(t => Object.values(t)[0]));
  
  process.exit(0);
}

checkSchema().catch(err => {
  console.error(err);
  process.exit(1);
});
