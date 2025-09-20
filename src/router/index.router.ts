import { Express, Router } from "express";
import endpoint from "./endpoint.router";
import destroyed from "./destroy.router";
import auth from "./auth.router";
import file from "./file.router";
import path from "path";
import fs from "fs";
import db from "../db/config.db";
import { notFoundHandler } from "src/middlewares/notFoundHandler";
import { MainController } from "src/controllers/main.controller";
import middlewaresMiddleware from "src/middlewares/middlewares.middleware";
import errorHandler from "src/middlewares/errorHandler";

// Tạo router chính
const router = Router();
const modulesDir = path.join(__dirname, "modules");

// Mảng lưu các route đã đăng ký
const moduleRoutes: string[] = [];

// Đọc tất cả các module trong thư mục `modules`
fs.readdirSync(modulesDir).forEach((file) => {
  const modulePath = path.join(modulesDir, file);

  if (fs.existsSync(modulePath)) {
    const mod = require(modulePath);

    // Kiểm tra xem module có phương thức Router không
    if (typeof mod.Router === "function") {
      console.log(`Loading module: ${file}`);

      mod.model = { Knex: db }; // Thiết lập model nếu cần
      const tempRouter = Router(); // Tạo router tạm thời
      mod.Router(mod.model, tempRouter); // Đăng ký route từ module

      // Duyệt qua các route trong router tạm thời
      tempRouter.stack.forEach((routeLayer) => {
        if (routeLayer.route) {
          const routePath = routeLayer.route.path;
          const moduleKey = path.basename(file, path.extname(file)); // Tên file module (không có phần mở rộng)

          if (routePath.includes(moduleKey)) {
            // Kiểm tra trùng lặp route
            if (moduleRoutes.includes(routePath)) {
              console.warn(
                `Warning: Route ${routePath} is duplicated in module ${file}`
              );
            } else {
              moduleRoutes.push(routePath);
              router.use(`/api`, tempRouter); // Gắn route vào router chính
              console.log(`Route registered: /api${routePath}`);
            }
          } else {
            console.warn(
              `Route ${routePath} in module ${file} does not match module key.`
            );
          }
        }
      });
    } else {
      console.warn(`Module ${file} does not export a Router function.`);
    }
  } else {
    console.warn(`Module ${file} does not exist. Skipping.`);
  }
});

// Đăng ký các route mặc định sau khi kiểm tra
const route = (app: Express): void => {
  console.log("Registered module routes:", moduleRoutes);

  const defaultRoutes = [
    { path: "/api/auth/", handler: auth },
    { path: "/api/media/", handler: file },
    { path: "/api/destroy/", handler: destroyed },
    { path: "/api/", handler: endpoint },
  ];

  defaultRoutes.forEach(({ path: routePath, handler }) => {
    router.use(routePath, handler);
    console.log(`Default route registered: ${routePath}`);
  });


  app.use(router);

  // Middleware xử lý 404
//   app.use(notFoundHandler);

  // Middleware xử lý lỗi
  app.use(errorHandler);
};

export default route;
