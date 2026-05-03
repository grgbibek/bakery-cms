import express from 'express';
import { getSettings, updateSetting } from '../controllers/settingController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get all settings (useful for frontend config)
router.get('/', getSettings);

// Admin only route to update settings
router.post('/update', protect, adminOnly, updateSetting);

export default router;
