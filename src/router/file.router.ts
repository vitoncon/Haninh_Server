import { Router, NextFunction, Request, Response } from "express";
import fileService from "@services/file.service";
import middlewaresMiddleware from "src/middlewares/middlewares.middleware";

const router = Router();

// Define the routes
router.post(
  "/file",
  middlewaresMiddleware.checkLogin,
  fileService.uploadMiddleware.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      fileService.uploadSingle(req, res);
    } catch (error) {
      next(error); // Handle errors
    }
  }
);

router.post(
  "/files",
  middlewaresMiddleware.checkLogin,
  fileService.uploadMiddleware.array("files"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      fileService.uploadMultiple(req, res);
    } catch (error) {
      next(error); // Handle errors
    }
  }
);

router.delete("/file",
    middlewaresMiddleware.checkLogin, (req: Request, res: Response, next: NextFunction) => {
  fileService.handleDeleteFile(req, res, next).catch(next);
});

export default router;
