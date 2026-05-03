import pool from '../config/db.js';
import { sendOrderCreatedEmailToCustomer, sendOrderConfirmationToCustomer, sendOrderCancellationToCustomer } from '../utils/notifier.js';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        image_thumb: rows[0].image_thumb_url,
        options: item.options ? JSON.stringify(item.options) : null
      });
    }

    // Fetch delivery settings from new settings table
    const [settingRows] = await connection.query('SELECT setting_value FROM settings WHERE setting_key = "delivery_settings"');
    const settings = settingRows.length > 0 ? JSON.parse(settingRows[0].setting_value) : {
      base_fee: 100,
      premium_fee: 200,
      free_min: 2000,
      nearby_areas: ''
    };

    const subtotal = totalAmount;
    let deliveryCharge = 0;

    if (subtotal < settings.free_min) {
      const nearbyList = (settings.nearby_areas || '').split(',').map(a => a.trim().toLowerCase());
      const customerArea = (customer.area || '').toLowerCase();
      const isNearby = nearbyList.includes(customerArea);
      deliveryCharge = isNearby ? settings.base_fee : settings.premium_fee;
    }

    const finalTotal = subtotal + deliveryCharge;

    // Generate a unique tracking ID
    const trackingId = randomUUID();

    // Insert the main order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (tracking_id, customer_name, customer_email, customer_phone, customer_address, total_amount, delivery_charge, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [trackingId, customer.name, customer.email, customer.phone, customer.address, finalTotal, deliveryCharge, customer.payment_method || 'Cash']
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of finalCartItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, product_options) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price_at_purchase, item.options]
      );
    }

    // Insert initial activity log
    await connection.query(
      'INSERT INTO order_logs (order_id, status, notes) VALUES (?, ?, ?)',
      [orderId, 'pending', 'Order placed by customer']
    );

    await connection.commit();
    
    // Fire off notifications asynchronously (do not await)
    if (customer.email) {
      sendOrderCreatedEmailToCustomer(orderId, trackingId, customer, finalCartItems, totalAmount).catch(console.error);
    }

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

export const getRiderOrders = async (req, res) => {
  const riderId = req.user.id;
  try {
    // Return orders that are:
    // 1. Ready for pickup and NOT assigned to anyone (available)
    // 2. Assigned to this rider and in delivery (shipped)
    const [rows] = await pool.query(`
      SELECT * FROM orders 
      WHERE (status = 'ready' AND rider_id IS NULL) 
         OR (rider_id = ?)
      ORDER BY created_at DESC
    `, [riderId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve rider orders' });
  }
};

export const pickOrder = async (req, res) => {
  const { id } = req.params;
  const riderId = req.user.id;

  try {
    // Check if order is already picked
    const [orders] = await pool.query('SELECT rider_id, status FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
    
    if (orders[0].rider_id) {
      return res.status(400).json({ message: 'Order has already been picked by another rider' });
    }

    await pool.query('UPDATE orders SET rider_id = ?, status = ? WHERE id = ?', [riderId, 'shipped', id]);

    // Log the activity
    await pool.query(
      'INSERT INTO order_logs (order_id, status, notes, user_id) VALUES (?, ?, ?, ?)',
      [id, 'shipped', 'Order picked up by rider', riderId]
    );

    res.json({ message: 'Order picked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to pick order' });
  }
};


export const getOrderDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.image_thumb_url 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`, 
      [id]
    );
    
    const [logs] = await pool.query(
      `SELECT ol.*, u.username 
       FROM order_logs ol 
       LEFT JOIN users u ON ol.user_id = u.id 
       WHERE ol.order_id = ? 
       ORDER BY ol.created_at DESC`, 
      [id]
    );
    
    res.json({
      ...orders[0],
      items: items.map(item => ({
        ...item,
        options: item.product_options ? JSON.parse(item.product_options) : null
      })),
      logs
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve order items' });
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

    // Insert into order_logs
    await pool.query(
      'INSERT INTO order_logs (order_id, status, notes, user_id) VALUES (?, ?, ?, ?)',
      [id, status, notes || null, req.user?.id || null]
    );

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    const order = orders[0];

    if (order) {
      if (status === 'confirmed' && order.customer_email) {
        sendOrderConfirmationToCustomer(order).catch(console.error);
      } else if (status === 'cancelled' && order.customer_email) {
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
      `SELECT oi.quantity, oi.price_at_purchase, oi.product_options, p.name AS product_name, p.image_url AS image, p.image_thumb_url AS image_thumb
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
        image_thumb: i.image_thumb || null,
        options: i.product_options ? JSON.parse(i.product_options) : null
      }))
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
};

export const uploadPaymentProof = async (req, res) => {
  const { id } = req.params;
  const { image } = req.body; // Base64 image

  if (!image) return res.status(400).json({ message: 'No image provided' });

  try {
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return res.status(400).json({ message: 'Invalid image format' });

    const mimeType = matches[1];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({ message: 'Only image files (JPG, PNG, GIF, WEBP) are allowed' });
    }

    const extension = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
    const buffer = Buffer.from(matches[2], 'base64');
    
    const filename = `proof_order_${id}_${Date.now()}.${extension}`;
    
    // Create Proofs/YYYY-MM-DD folder structure
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const relativeDir = path.join('uploads', 'Proofs', dateStr);
    const absoluteDir = path.join(__dirname, '..', relativeDir);
    
    if (!fs.existsSync(absoluteDir)) {
      fs.mkdirSync(absoluteDir, { recursive: true });
    }

    fs.writeFileSync(path.join(absoluteDir, filename), buffer);

    const relativePath = `/${relativeDir}/${filename}`.replace(/\\/g, '/');
    await pool.query('UPDATE orders SET payment_proof = ? WHERE id = ?', [relativePath, id]);

    // Log the activity
    await pool.query(
      'INSERT INTO order_logs (order_id, status, notes, user_id) VALUES (?, ?, ?, ?)',
      [id, 'payment_verified', 'Payment proof uploaded by rider', req.user?.id || null]
    );

    res.json({ message: 'Payment proof uploaded successfully', path: relativePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to upload payment proof' });
  }
};
