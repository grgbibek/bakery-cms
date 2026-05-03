import express from 'express';
import { getContent, updateContent } from '../controllers/contentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Website Content management
 */

/**
 * @swagger
 * /api/content:
 *   get:
 *     summary: get all content blocks
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: List of content
 */
router.get('/', getContent);

/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: Update or create a content block
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key_name:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated content
 */
router.post('/', protect, adminOnly, updateContent);

export default router;
