import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';

const router = Router();

/**
 * POST /api/chatbot
 * Request body: { question: string }
 * Response: { reply: string }
 */
router.post('/', AIController.chatbot);

export default router;
