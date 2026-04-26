import pool from '../config/db.js';
import { sendOrderCreatedEmailToCustomer, sendOrderConfirmationToCustomer, sendOrderCancellationToCustomer } from '../utils/notifier.js';
import { randomUUID } from 'crypto';

export const createOrder = async (req, res) => {
  const { customer, cartItems } = req.body;
  
  if (!customer || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'Invalid order data' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let totalAmount = 0;
    const finalCartItems = [];

    // Calculate secure total amount backed by DB products
    for (const item of cartItems) {
      const [rows] = await connection.query('SELECT name, price, image_thumb_url FROM products WHERE id = ?', [item.id]);
      if (rows.length === 0) {
        throw new Error(`Product ID ${item.id} not found`);
      }
      
      const realPrice = parseFloat(rows[0].price);
      const quantity = parseInt(item.quantity, 10);
      
      totalAmount += (realPrice * quantity);

      finalCartItems.push({
        product_id: item.id,
        name: rows[0].name,
        quantity,
        price_at_purchase: realPrice,
        image_thumb: rows[0].image_thumb_url
      });
    }

    // Generate a unique tracking ID
    const trackingId = randomUUID();

    // Insert the main order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (tracking_id, customer_name, customer_email, customer_phone, customer_address, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [trackingId, customer.name, customer.email, customer.phone, customer.address, totalAmount]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of finalCartItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price_at_purchase]
      );
    }

    await connection.commit();
    
    // Fire off notifications asynchronously (do not await)
    sendOrderCreatedEmailToCustomer(orderId, trackingId, customer, finalCartItems, totalAmount).catch(console.error);

    res.status(201).json({ message: 'Order successfully created', orderId, trackingId });

  } catch (error) {
    await connection.rollback();
    console.error('Checkout Error: ', error);
    res.status(500).json({ message: error.message || 'Server Error processing checkout' });
  } finally {
    connection.release();
  }
};

export const getOrders = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    let query = 'UPDATE orders SET status = ? WHERE id = ?';
    let params = [status, id];

    if (notes !== undefined) {
      query = 'UPDATE orders SET status = ?, admin_notes = ? WHERE id = ?';
      params = [status, notes, id];
    }

    const [result] = await pool.query(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    const order = orders[0];

    if (order) {
      if (status === 'confirmed') {
        sendOrderConfirmationToCustomer(order).catch(console.error);
      } else if (status === 'cancelled') {
        sendOrderCancellationToCustomer(order, notes).catch(console.error);
      }
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const [statsResult] = await pool.query(`
      SELECT 
        COUNT(id) as total_orders, 
        COALESCE(SUM(total_amount), 0) as total_revenue, 
        COALESCE(AVG(total_amount), 0) as average_order_value 
      FROM orders
    `);

    const stats = statsResult[0] || { total_orders: 0, total_revenue: 0, average_order_value: 0 };

    res.json({
      totalOrders: Number(stats.total_orders),
      totalRevenue: Number(stats.total_revenue),
      averageOrderValue: Number(stats.average_order_value)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate statistics' });
  }
};

export const trackOrder = async (req, res) => {
  const { trackingId } = req.params;

  if (!trackingId) {
    return res.status(400).json({ message: 'Tracking ID is required' });
  }

  try {
    // Fetch the order
    const [orders] = await pool.query(
      'SELECT id, tracking_id, customer_name, customer_email, status, total_amount, created_at FROM orders WHERE tracking_id = ?',
      [trackingId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found. Please check your tracking ID.' });
    }

    const order = orders[0];

    // Fetch the order items with product names and thumbnails
    const [items] = await pool.query(
      `SELECT oi.quantity, oi.price_at_purchase, p.name AS product_name, p.image_url AS image, p.image_thumb_url AS image_thumb
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    res.json({
      trackingId: order.tracking_id,
      customerName: order.customer_name,
      status: order.status,
      totalAmount: Number(order.total_amount),
      createdAt: order.created_at,
      items: items.map(i => ({
        name: i.product_name,
        quantity: i.quantity,
        price: Number(i.price_at_purchase),
        image: i.image || null,
        image_thumb: i.image_thumb || null
      }))
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
};
