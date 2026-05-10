import express from 'express';
import { getAllPromos, createPromo, updatePromo, deletePromo, validatePromo } from '../controllers/promoController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer route (public)
router.post('/validate', validatePromo);

// Admin routes (protected)
router.get('/', protect, adminOnly, getAllPromos);
router.post('/', protect, adminOnly, createPromo);
router.put('/:id', protect, adminOnly, updatePromo);
router.delete('/:id', protect, adminOnly, deletePromo);

export default router;
