/**
 * AI Controller
 * Handles HTTP requests for AI chat endpoints
 */

import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { BadRequestError } from '../core/errors/error.response';

export class AIController {
  /**
   * Handle public chat request (no login required)
   * POST /api/ai/public-chat
   */
  static async publicChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== 'string') {
        throw new BadRequestError('Message is required and must be a string');
      }

      const trimmedMessage = message.trim();
      if (trimmedMessage.length === 0) {
        throw new BadRequestError('Message cannot be empty');
      }

      const reply = await AIService.publicChat(trimmedMessage, history || []);

      res.status(200).json({
        reply
      });
    } catch (error: any) {
      console.error('Error in publicChat controller:', error);
      
      if (error instanceof BadRequestError) {
        res.status(400).json({
          error: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred'
      });
    }
  }

  /**
   * Handle student chat request (requires login)
   * POST /api/ai/student-chat
   */
  static async studentChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, history } = req.body;
      const decode = req.body.decode; // Set by checkLogin middleware

      if (!message || typeof message !== 'string') {
        throw new BadRequestError('Message is required and must be a string');
      }

      const trimmedMessage = message.trim();
      if (trimmedMessage.length === 0) {
        throw new BadRequestError('Message cannot be empty');
      }

      // User info is available in decode (set by checkLogin middleware)
      const userId = decode?.id;
      // const userRoles = decode.roles;

      const reply = await AIService.studentChat(trimmedMessage, userId, history || []);

      res.status(200).json({
        reply
      });
    } catch (error: any) {
      console.error('Error in studentChat controller:', error);
      
      if (error instanceof BadRequestError) {
        res.status(400).json({
          error: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred'
      });
    }
  }

  static async chatbot(req: Request, res: Response): Promise<void> {
    try {
      const { question, history } = req.body;

      if (!question || typeof question !== 'string') {
        throw new BadRequestError('Question is required and must be a string');
      }

      const trimmedQuestion = question.trim();
      if (trimmedQuestion.length === 0) {
        throw new BadRequestError('Question cannot be empty');
      }

      const reply = await AIService.publicChat(trimmedQuestion, history || []);

      res.status(200).json({ reply, answer: reply });
    } catch (error: any) {
      console.error('Error in chatbot controller:', error);

      if (error instanceof BadRequestError) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
}

