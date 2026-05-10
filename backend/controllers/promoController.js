import db from '../config/db.js';

export const getAllPromos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM promo_codes ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching promo codes:', err);
    res.status(500).json({ message: 'Failed to fetch promo codes' });
  }
};

export const createPromo = async (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order_amount, expiration_date, usage_limit, is_active } = req.body;
    
    if (!code || !discount_type || discount_value === undefined) {
      return res.status(400).json({ message: 'Code, discount type, and discount value are required' });
    }

    const [existing] = await db.query('SELECT id FROM promo_codes WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }

    const [result] = await db.query(
      `INSERT INTO promo_codes 
        (code, discount_type, discount_value, min_order_amount, expiration_date, usage_limit, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase(), 
        discount_type, 
        discount_value, 
        min_order_amount || 0, 
        expiration_date || null, 
        usage_limit || null, 
        is_active !== undefined ? is_active : 1
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Promo code created successfully' });
  } catch (err) {
    console.error('Error creating promo code:', err);
    res.status(500).json({ message: 'Failed to create promo code' });
  }
};

export const updatePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discount_type, discount_value, min_order_amount, expiration_date, usage_limit, is_active } = req.body;

    const [existing] = await db.query('SELECT id FROM promo_codes WHERE code = ? AND id != ?', [code, id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }

    await db.query(
      `UPDATE promo_codes SET 
        code = ?, discount_type = ?, discount_value = ?, min_order_amount = ?, 
        expiration_date = ?, usage_limit = ?, is_active = ? 
       WHERE id = ?`,
      [code.toUpperCase(), discount_type, discount_value, min_order_amount || 0, expiration_date || null, usage_limit || null, is_active, id]
    );

    res.json({ message: 'Promo code updated successfully' });
  } catch (err) {
    console.error('Error updating promo code:', err);
    res.status(500).json({ message: 'Failed to update promo code' });
  }
};

export const deletePromo = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM promo_codes WHERE id = ?', [id]);
    res.json({ message: 'Promo code deleted successfully' });
  } catch (err) {
    console.error('Error deleting promo code:', err);
    res.status(500).json({ message: 'Failed to delete promo code' });
  }
};

export const validatePromo = async (req, res) => {
  try {
    const { code, order_amount } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Promo code is required' });
    }

    const [rows] = await db.query('SELECT * FROM promo_codes WHERE code = ?', [code.toUpperCase()]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Invalid promo code' });
    }

    const promo = rows[0];

    if (!promo.is_active) {
      return res.status(400).json({ message: 'This promo code is no longer active' });
    }

    if (promo.expiration_date && new Date(promo.expiration_date) < new Date()) {
      return res.status(400).json({ message: 'This promo code has expired' });
    }

    if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
      return res.status(400).json({ message: 'This promo code has reached its usage limit' });
    }

    if (order_amount && Number(order_amount) < Number(promo.min_order_amount)) {
      return res.status(400).json({ 
        message: `Minimum order amount of Rs. ${promo.min_order_amount} is required` 
      });
    }

    // Calculate discount for preview
    let discountAmount = 0;
    if (order_amount) {
      if (promo.discount_type === 'percentage') {
        discountAmount = (Number(order_amount) * Number(promo.discount_value)) / 100;
      } else {
        discountAmount = Number(promo.discount_value);
      }
      // Ensure discount doesn't exceed order amount
      discountAmount = Math.min(discountAmount, Number(order_amount));
    }

    res.json({ 
      valid: true, 
      promo: {
        id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value
      },
      discount_amount: discountAmount
    });

  } catch (err) {
    console.error('Error validating promo code:', err);
    res.status(500).json({ message: 'Failed to validate promo code' });
  }
};
