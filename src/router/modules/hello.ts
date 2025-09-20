// src/router/modules/hello.ts
module.exports = {
    keyType: {
        'created_at': 'date',
        'updated_at': 'date',
    },

    Router(model: any, router: any) {
        // Đặt giá trị cho model.Router nếu cần
        model.Router = 'hello'; // Đặt giá trị cho model.Router
        
        // Đăng ký route `GET /api/hello`
        router.get(`/hello`, this.sayHello); // Không cần thêm `${model.Router}/`
        
    },

    async sayHello(req: any, res: any, next: any) {
        try {
            res.status(200).json({
                message: 'Hello from /api/hello!',
            });
        } catch (error) {
            next(error);
        }
    },
};
