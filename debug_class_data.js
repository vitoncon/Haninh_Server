const mysql = require('mysql2/promise');
(async () => {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'haninh_academy_manager'
    });
    const [classes] = await conn.execute('SELECT id, class_name FROM classes WHERE class_name LIKE ?', ['%Anh Giao Tiếp 10%']);
    console.log('--- DB CHECK ---');
    console.log('CLASSES:', JSON.stringify(classes));
    if (classes.length > 0) {
        const classId = classes[0].id;
        const [students] = await conn.execute('SELECT * FROM class_students WHERE class_id = ?', [classId]);
        console.log('STUDENTS IN CLASS:', students.length);
        console.log('STUDENT IDS:', JSON.stringify(students.map(s => s.student_id)));
        const [fees] = await conn.execute('SELECT id, student_id, amount, payment_status FROM fees WHERE class_id = ? AND is_deleted = 0', [classId]);
        console.log('FEES FOR CLASS:', fees.length);
        console.log('FEES RECORDS:', JSON.stringify(fees));
    }
    console.log('----------------');
    await conn.end();
})();
