import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Use safely parsed Env Vars
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_SENDER = process.env.TWILIO_WHATSAPP_SENDER; // e.g. 'whatsapp:+14155238886'
const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER; // e.g. 'whatsapp:+9779841234567'

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail', // Standard configuration for Gmail
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

let twilioClient = null;
if (TWILIO_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
}

export const sendOrderNotificationToAdmin = async (orderId, customer, cartItems, totalAmount) => {
  const itemDetails = cartItems.map(item => `- ${item.quantity}x ${item.name} (Rs. ${item.price_at_purchase})`).join('\n');
  const messageBody = `🍞 New Bakery Order Received!\n\nOrder ID: #${orderId}\nCustomer: ${customer.name}\nPhone: ${customer.phone}\nAddress: ${customer.address}\n\nItems:\n${itemDetails}\n\nTotal: Rs. ${totalAmount}`;

  // 1. Send Email Notification
  if (transporter && ADMIN_EMAIL) {
    try {
      await transporter.sendMail({
        from: `"Bakery CMS" <${EMAIL_USER}>`,
        to: ADMIN_EMAIL,
        subject: `New Order #${orderId} from ${customer.name}`,
        text: messageBody,
      });
      console.log('Admin email notification sent successfully.');
    } catch (error) {
      console.error('Failed to send admin email notification:', error.message);
    }
  } else {
    console.warn('⚠️ EMAIL_USER, EMAIL_PASS, or ADMIN_EMAIL not set. Skipping email notification.');
    console.log('[DRY RUN] Email Body:', messageBody);
  }

  // 2. Send WhatsApp Notification
  if (twilioClient && TWILIO_WHATSAPP_SENDER && ADMIN_WHATSAPP_NUMBER) {
    try {
      await twilioClient.messages.create({
        from: TWILIO_WHATSAPP_SENDER,
        to: ADMIN_WHATSAPP_NUMBER,
        body: messageBody,
      });
      console.log('Admin WhatsApp notification sent successfully.');
    } catch (error) {
      console.error('Failed to send Admin WhatsApp notification:', error.message);
    }
  } else {
    console.warn('⚠️ TWILIO Credentials or WhatsApp numbers not fully set. Skipping WhatsApp notification.');
    console.log('[DRY RUN] WhatsApp Body:', messageBody);
  }
};
