const knex = require('knex');
const config = require('./knexfile.js'); // Assuming knexfile is in Haninh_Server

const db = knex(config.development || config);

async function fixDB() {
  try {
    console.log('Fixing fees status...');
    
    // Attempt to map any stray Vietnamese values to UNPAID
    await db.raw(`UPDATE fees SET status = 'UNPAID' WHERE status = 'Chưa thanh toán' OR status = 'chua_dong' OR status = 'debt'`);
    
    // Attempt to map to PENDING
    await db.raw(`UPDATE fees SET status = 'PENDING' WHERE status = 'Chờ xác nhận' OR status = 'cho_xac_nhan'`);
    
    // Attempt to map to PAID
    await db.raw(`UPDATE fees SET status = 'PAID' WHERE status = 'Đã thanh toán' OR status = 'da_thanh_toan' OR status = 'paid'`);

    console.log('DB fix completed.');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing DB:', err);
    process.exit(1);
  }
}

fixDB();
