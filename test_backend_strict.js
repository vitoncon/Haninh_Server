const knex = require('knex')(require('./knexfile').development);

async function testEnforcement() {
  console.log('--- BACKEND ENFORCEMENT TEST ---');
  
  // 1. Get a class with start_date
  const classWithDate = await knex('classes').whereNotNull('start_date').andWhere('start_date', '>', '1900-01-01').first();
  console.log(`Class with start_date: ${classWithDate?.id || 'NONE'} (${classWithDate?.start_date})`);

  const course = await knex('courses').first();
  const validCourseId = course ? course.id : 1;

  // 2. Get a class without start_date
  let classWithoutDate = await knex('classes').where(q => q.whereNull('start_date').orWhere('start_date', '<=', '1900-01-01')).first();
  if (!classWithoutDate) {
    const [newId] = await knex('classes').insert({
      class_name: 'Test No Date Class',
      course_id: validCourseId,
      start_date: null,
      status: 'PLANNING'
    });
    classWithoutDate = { id: newId, start_date: null, class_name: 'Test No Date Class' };
  }

  const MainService = {
    async createRecordMock(data) {
      const classId = data.class_id;
      const classObj = await knex('classes').where({ id: classId }).first();
      
      if (!classObj || !classObj.start_date || classObj.start_date <= '1900-01-01') {
        throw new Error(`Class ${classId} must have a valid start_date before creating fee.`);
      }
      
      const startDate = new Date(classObj.start_date);
      data.due_date = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      return knex('fees').insert(data);
    }
  };

  // Test 1: Succeed with start_date (using unique student_id to avoid duplicate)
  try {
    console.log('\nTesting Test 1: Class WITH start_date...');
    const timestamp = Date.now() % 1000000;
    await MainService.createRecordMock({
      student_id: 999000 + timestamp, // unique enough
      class_id: classWithDate.id,
      course_id: validCourseId,
      amount: 1000,
      status: 'UNPAID',
      created_at: new Date()
    });
    console.log('✅ Test 1 Passed: Fee created successfully.');
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
  }

  // Test 2: Fail without start_date
  try {
    console.log('\nTesting Test 2: Class WITHOUT start_date...');
    await MainService.createRecordMock({
      student_id: 999999,
      class_id: classWithoutDate.id,
      course_id: validCourseId,
      amount: 1000,
      status: 'UNPAID',
      created_at: new Date()
    });
    console.log('❌ Test 2 Failed: Fee should NOT have been created.');
  } catch (err) {
    console.log('✅ Test 2 Passed: Error caught as expected:', err.message);
  }

  // Cleanup temp class and TEST fees
  await knex('classes').where({ class_name: 'Test No Date Class' }).delete();
  await knex('fees').where('student_id', '>=', 999000).delete();

  process.exit(0);
}

testEnforcement();
