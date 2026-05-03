import express from 'express';
import { createOrder, getOrders, getOrderStats, trackOrder, updateOrderStatus, getOrderDetails, uploadPaymentProof, getRiderOrders, pickOrder } from '../controllers/orderController.js';
import { protect, managerOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Customer checkout and order processing
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Submit a new customer order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   address:
 *                     type: string
 *               cartItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order successfully created
 */
router.post('/', createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Retrieve all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders
 */
router.get('/', protect, managerOrAdmin, getOrders);
router.get('/rider', protect, getRiderOrders);
router.post('/:id/pick', protect, pickOrder);

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Retrieve order statistics
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics object
 */
router.get('/stats', protect, managerOrAdmin, getOrderStats);

/**
 * @swagger
 * /api/orders/track/{trackingId}:
 *   get:
 *     summary: Track an order by its tracking ID (public)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID tracking ID returned at checkout
 *     responses:
 *       200:
 *         description: Order tracking details
 *       404:
 *         description: Order not found
 */
router.get('/track/:trackingId', trackOrder);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Order not found
 */
router.put('/:id/status', protect, updateOrderStatus); // This is also used by riders to mark as delivered

/**
 * @swagger
 * /api/orders/{id}/details:
 *   get:
 *     summary: Get full order details (admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details with items
 */
router.get('/:id/details', protect, getOrderDetails);
router.post('/:id/payment-proof', protect, uploadPaymentProof);

export default router;
