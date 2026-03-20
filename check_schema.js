
const knex = require('knex');
const config = require('./src/db/config.db');
const db = knex(config.default || config);

async function checkSchema() {
    try {
        const columns = await db.raw('SHOW COLUMNS FROM class_students');
        console.log('Columns in class_students:', columns[0].map(c => c.Field));
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await db.destroy();
    }
}

checkSchema();
