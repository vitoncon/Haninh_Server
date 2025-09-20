import { Router, Request, Response } from 'express';
const router = Router();

import { MainController } from 'src/controllers/main.controller';
import middlewaresMiddleware from 'src/middlewares/middlewares.middleware';

router.delete('/:router/:id', middlewaresMiddleware.GuardDestroyMiddleware, MainController.delete);

export default router;
