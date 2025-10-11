// knexfile.js
require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER_NAME || 'root',
      password: process.env.DB_USER_PASS || '',
      database: process.env.DB_NAME || 'haninh_academy_manager',
      port: Number(process.env.DB_PORT) || 3306,
    },
    migrations: {
      directory: './migrations', // Đường dẫn đến thư mục chứa migrations
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER_NAME,
      password: process.env.DB_USER_PASS,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306,
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    }
  }
};
