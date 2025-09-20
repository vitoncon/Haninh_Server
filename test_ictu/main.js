// Import các thư viện cần thiết
const express = require('express');
const Knex = require('knex');
const shiftTestSessionModule = require('./path/to/your/module'); // Đường dẫn đến module bạn đã chia sẻ

// Cấu hình kết nối đến cơ sở dữ liệu
const dbConfig = {
    client: 'mysql', // Hoặc loại cơ sở dữ liệu bạn đang sử dụng
    connection: {
        host: 'localhost',
        user: 'your_db_user',
        password: 'your_db_password',
        database: 'your_db_name'
    }
};

// Khởi tạo Knex với cấu hình đã chỉ định
const knex = Knex(dbConfig);

// Khởi tạo Express app
const app = express();
const router = express.Router();

// Gán Knex vào module để sử dụng trong router
shiftTestSessionModule.model = { Knex: knex }; // Thiết lập model cho module



// Sử dụng router từ module
shiftTestSessionModule.Router(shiftTestSessionModule, router);

// Gán router vào ứng dụng Express
app.use(express.json()); // Để có thể nhận JSON payload
app.use('/luyenthi-thpt/api/shift-test-session', router);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
