import pool from '../config/db.js';
import { sendOrderNotificationToAdmin } from '../utils/notifier.js';

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
      const [rows] = await connection.query('SELECT name, price FROM products WHERE id = ?', [item.id]);
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
        price_at_purchase: realPrice
      });
    }

    // Insert the main order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, total_amount) VALUES (?, ?, ?, ?, ?)',
      [customer.name, customer.email, customer.phone, customer.address, totalAmount]
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
    sendOrderNotificationToAdmin(orderId, customer, finalCartItems, totalAmount).catch(console.error);

    res.status(201).json({ message: 'Order successfully created', orderId });

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
