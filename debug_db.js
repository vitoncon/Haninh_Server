const knex = require('knex');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER_NAME || 'root',
    password: process.env.DB_USER_PASS || '',
    database: process.env.DB_NAME || 'haninh_academy_manager',
    port: Number(process.env.DB_PORT) || 3306,
  }
});

async function check() {
    try {
        console.log('--- Teacher ID 7 details ---');
        const teacher = await db('teachers').where({ id: 7 }).first();
        console.log(teacher);
    } catch (e) {
        console.error(e);
    } finally {
        await db.destroy();
    }
}

check();
