import { Router, Request, Response } from 'express';
const router = Router();

import { MainController } from 'src/controllers/main.controller';
import middlewaresMiddleware from 'src/middlewares/middlewares.middleware';

router.get('/profile', middlewaresMiddleware.checkLogin, MainController.getProfile)

// Add a record to any table based on 'table'
router.post('/:router',middlewaresMiddleware.GuardMiddleware, MainController.create);

// Get all records from any table based on 'table'
router.get('/:router',middlewaresMiddleware.GuardMiddleware, MainController.get );

// Update a record in any table based on 'table' and 'id'
router.put('/:router/:id',middlewaresMiddleware.GuardMiddleware, MainController.put );

// Delete a record in any table based on 'table' and 'id'
router.delete('/:router/destroy/:id',middlewaresMiddleware.GuardMiddleware, MainController.delete);
router.delete('/:router/:id',middlewaresMiddleware.GuardMiddleware, MainController.setIsDelete);

export default router;
