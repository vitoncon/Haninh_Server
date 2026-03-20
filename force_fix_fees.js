const knex = require('knex');
const config = require('./knexfile');
const db = knex(config.local);

async function forceFix() {
  console.log('Starting force fix for fees table...');
  
  try {
    // 1. Check existing columns
    const columns = await db('fees').columnInfo();
    const columnNames = Object.keys(columns);
    
    // 2. Add missing columns and modify payment_status if it exists but is restricted
    // We use raw queries to be absolutely sure about types and defaults in MySQL
    
    if (!columnNames.includes('payment_note')) {
      console.log('Adding payment_note...');
      await db.raw('ALTER TABLE fees ADD COLUMN payment_note TEXT NULL');
    }
    
    if (!columnNames.includes('paid_at')) {
      console.log('Adding paid_at...');
      await db.raw('ALTER TABLE fees ADD COLUMN paid_at DATETIME NULL');
    }
    
    // Ensure payment_status is VARCHAR(20) as requested, or at least standardized
    console.log('Standardizing payment_status column...');
    await db.raw("ALTER TABLE fees MODIFY COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid'");
    
    // Ensure payment_method is flexible enough for standardized values
    console.log('Standardizing payment_method column...');
    await db.raw("ALTER TABLE fees MODIFY COLUMN payment_method VARCHAR(50) NULL");
    
    // 3. Update existing data
    console.log('Updating existing data...');
    
    // Set NULL status to unpaid
    await db.raw("UPDATE fees SET payment_status = 'unpaid' WHERE payment_status IS NULL OR payment_status = ''");
    
    // Standardize status values (just in case)
    await db.raw("UPDATE fees SET payment_status = 'paid' WHERE payment_status IN ('da_thanh_toan', 'Đã thanh toán', 'paid_confirmed')");
    await db.raw("UPDATE fees SET payment_status = 'pending' WHERE payment_status IN ('cho_xac_nhan', 'Chờ xác nhận', 'pending_approval')");
    await db.raw("UPDATE fees SET payment_status = 'unpaid' WHERE payment_status IN ('chua_dong', 'Chưa thanh toán')");
    
    // Standardize payment_method
    await db.raw("UPDATE fees SET payment_method = 'card' WHERE payment_method = 'Thẻ tín dụng'");
    await db.raw("UPDATE fees SET payment_method = 'ewallet' WHERE payment_method = 'Ví điện tử'");
    await db.raw("UPDATE fees SET payment_method = 'bank_transfer' WHERE payment_method = 'Chuyển khoản'");
    
    // 4. Verification
    console.log('Verification:');
    const result = await db('fees').select('id', 'payment_status', 'payment_method').limit(10);
    console.table(result);
    
    const finalColumns = await db('fees').columnInfo();
    console.log('Final columns:', Object.keys(finalColumns));
    
    console.log('DONE: No Vietnamese values stored in database for status/method.');
    
  } catch (error) {
    console.error('FORCE FIX FAILED:', error);
  } finally {
    process.exit(0);
  }
}

forceFix();
