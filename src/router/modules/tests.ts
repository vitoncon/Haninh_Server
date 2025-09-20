import middlewaresMiddleware from "src/middlewares/middlewares.middleware";

// src/router/modules/hello.ts
module.exports = {
    keyType: {
        'created_at': 'date',
        'updated_at': 'date',
        'config': 'json'
    },

    Router(model: any, router: any) {
        // model.Router = 'hello'; // Đặt giá trị cho model.Router
        
  
        
        // Đăng ký các route
        router.post(`/tests/create`, this.create.bind(this, model)); // Sử dụng bind để truyền model
        router.get(`/tests/get1`,middlewaresMiddleware.MiddlewareClient('tests'), this.get.bind(this, model)); // Cũng sử dụng bind để truyền model
    },

    async create(model: any, req: any, res: any, next: any) {
        try {
            const { name } = req.body; // Giả sử bạn có trường name và description
            
            // Thực hiện chèn dữ liệu vào bảng tests
            console.log(name);
            
            const [id] = await model.Knex('tests').insert({
                name
            }); // Trả về ID của bản ghi vừa chèn

            res.status(201).json({
                message: 'Record created successfully!',
                id,
            });
        } catch (error) {
            next(error);
        }
    },

    async get(model: any, req: any, res: any, next: any) {
        try {
            const records = await model.Knex('tests').select('*'); // Lấy tất cả bản ghi từ bảng tests
            
            res.status(200).json({
                message: 'Fetched records successfully!',
                data: records,
            });
        } catch (error) {
            next(error);
        }
    },
};
