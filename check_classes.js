const knex = require('knex');
const config = require('./knexfile.js');
const db = knex(config.local || config.development || config);

async function check() {
  try {
    const columns = await db.raw('SHOW COLUMNS FROM classes');
    console.log('--- CLASSES COLUMNS ---');
    console.log(JSON.stringify(columns[0], null, 2));

    const sampleClasses = await db('classes').select('id', 'class_name', 'start_date').limit(3);
    console.log('--- SAMPLE CLASSES ---');
    console.log(JSON.stringify(sampleClasses, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await db.destroy();
  }
}

check();
