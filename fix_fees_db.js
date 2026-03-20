const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Default for XAMPP
    database: 'haninh_academy_manager'
  });

  try {
    console.log('Fixing payment_status based on paid_date...');
    const [result] = await connection.execute(`
      UPDATE fees 
      SET payment_status = 'paid' 
      WHERE paid_date IS NOT NULL AND payment_status != 'paid'
    `);
    console.log(`Success! Updated ${result.affectedRows} records.`);

    console.log('Verifying data...');
    const [rows] = await connection.execute(`
      SELECT id, student_id, class_id, payment_status, paid_date 
      FROM fees 
      WHERE paid_date IS NOT NULL
    `);
    console.table(rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}

fixDatabase();
