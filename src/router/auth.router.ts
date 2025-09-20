import { Router, Request, Response } from 'express';
import authController from 'src/controllers/auth.controller';
import { MainController } from 'src/controllers/main.controller';
import middlewaresMiddleware from 'src/middlewares/middlewares.middleware';

const router = Router();
// middlewaresMiddleware.GuardMiddleware,


router.post('/register',  authController.register);
router.post('/login',authController.login);
router.post('/refresh',authController.refreshToken);
router.post('/forgot-password',authController.forgotPassword);


//verify email
router.post('/send-email',authController.sendEmail)
router.post('/verify-email',authController.verifyEmail);

export default router;