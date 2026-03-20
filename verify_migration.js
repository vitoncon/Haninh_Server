const knex = require('knex')(require('./knexfile').development);

async function verify() {
  try {
    const invalidFees = await knex('fees')
      .whereNull('due_date')
      .orWhere('due_date', '<', '1900-01-01');
    
    console.log('--- VERIFICATION REPORT ---');
    console.log(`Total Fees with NULL or Invalid due_date: ${invalidFees.length}`);
    
    const fees = await knex('fees').limit(10);
    console.log('\nSample Fees Data:');
    console.table(fees.map(f => ({
      id: f.id,
      student_id: f.student_id,
      class_id: f.class_id,
      amount: f.amount,
      due_date: f.due_date,
      status: f.status
    })));

    if (invalidFees.length === 0) {
      console.log('\n✅ SUCCESS: All fees have valid due_date.');
    } else {
      console.log('\n❌ FAILURE: Some fees still have invalid due_date.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
}

verify();
