import knex, { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db: Knex = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST as string,
    user: process.env.DB_USER_NAME as string,
    password: process.env.DB_USER_PASS as string,
    database: process.env.DB_NAME as string,
    port: Number(process.env.DB_PORT),
  },
  pool: { min: 0, max: 7 },
  log: {
    warn(message: string) {
      console.log("Knex Warning:", message);
    },
    error(message: string) {
      console.log("Knex Error:", message);
    },
    deprecate(message: string) {
      console.log("Knex Deprecation:", message);
    },
    debug(message: string) {
      console.log("Knex Debug:", message);
    }
  }
});

// Check the database connection
(async () => {
  try {
    await db.raw('SELECT 1');
    console.log('Kết nối thành công!');
  } catch (error) {
    console.error('Không thể kết nối đến cơ sở dữ liệu:', error);
  }
})();

export default db; // Ensure you're exporting the db instance correctly
