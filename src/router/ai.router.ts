/**
 * AI Router
 * Routes for AI chat endpoints
 */

import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import middlewaresMiddleware from '../middlewares/middlewares.middleware';

const router = Router();

/**
 * POST /api/ai/public-chat
 * Public AI chat endpoint (no authentication required)
 * 
 * Request Body:
 * {
 *   "message": "string"
 * }
 * 
 * Response:
 * {
 *   "reply": "string"
 * }
 */
router.post('/public-chat', AIController.publicChat);

/**
 * POST /api/ai/student-chat
 * Student AI chat endpoint (requires authentication)
 * 
 * Request Body:
 * {
 *   "message": "string"
 * }
 * 
 * Headers:
 * Authorization: Bearer TOKEN
 * 
 * Response:
 * {
 *   "reply": "string"
 * }
 */
router.post('/student-chat', middlewaresMiddleware.checkLogin, AIController.studentChat);

export default router;
