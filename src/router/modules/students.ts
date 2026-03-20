// src/router/modules/students.ts
import { Router } from "express";
import { StudentImportController } from "../../controllers/student-import.controller";
import { StudentController } from "../../controllers/student.controller";
import middlewaresMiddleware from "../../middlewares/middlewares.middleware";

export const registerStudentRoutes = (model: any, router: Router) => {
  // Import học viên từ Excel
  router.post(
    "/students/import/preview",
    middlewaresMiddleware.checkLogin,
    StudentImportController.uploadMiddleware.single("file"),
    StudentImportController.preview as any
  );

  router.post(
    "/students/import/confirm",
    middlewaresMiddleware.checkLogin,
    StudentImportController.import as any
  );

  // Lấy thông tin học viên hiện tại (dựa trên user_id trong access token)
  router.get(
    "/students/me",
    middlewaresMiddleware.checkLogin,
    StudentController.getCurrentStudent as any
  );
};

export { registerStudentRoutes as Router };
