// src/router/modules/attendance.ts
import { Router } from "express";
import { AttendanceController } from "../../controllers/attendance.controller";
import middlewaresMiddleware from "../../middlewares/middlewares.middleware";

export const registerAttendanceRoutes = (model: any, router: Router) => {
  router.get("/attendance/teacher/classes", middlewaresMiddleware.checkLogin, AttendanceController.getTeacherClasses as any);
  router.post("/attendance/mark", middlewaresMiddleware.checkLogin, AttendanceController.markAttendance as any);

  // Support both POST (existing frontend) and GET (RESTful) for class attendance
  router.post("/attendance/class/:classId", middlewaresMiddleware.checkLogin, AttendanceController.getByClass as any);
  router.get("/attendance/class/:classId", middlewaresMiddleware.checkLogin, AttendanceController.getByClass as any);
  router.post("/attendance/student/:studentId", middlewaresMiddleware.checkLogin, AttendanceController.getByStudent as any);
  router.post("/attendance/analytics", middlewaresMiddleware.checkLogin, AttendanceController.getAnalytics as any);
};

export { registerAttendanceRoutes as Router };
