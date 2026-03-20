const mysql = require('mysql2/promise');
(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'haninh_academy_manager'
        });
        const [result] = await conn.execute("UPDATE fees SET payment_status = LOWER(TRIM(payment_status)) WHERE payment_status IS NOT NULL");
        console.log(`Cleaned ${result.affectedRows} records.`);
        await conn.end();
    } catch (error) {
        console.error('Error cleaning DB:', error);
        process.exit(1);
    }
})();
