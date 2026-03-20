import db from './src/db/config.db';
(async ()=> {
  try {
    const courses = await db('courses').limit(1);
    console.log(courses);
    process.exit(0);
  } catch(e) { console.error(e); process.exit(1); }
})();
