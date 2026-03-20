// src/router/modules/reports.ts
import { Router } from "express";
import { ReportController } from "../../controllers/report.controller";
import middlewaresMiddleware from "../../middlewares/middlewares.middleware";

export const registerReportRoutes = (model: any, router: Router) => {
  router.get("/reports/student/:id", middlewaresMiddleware.checkLogin, ReportController.exportStudentResults as any);
};

export { registerReportRoutes as Router };
