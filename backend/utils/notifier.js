// Use safely parsed Env Vars
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

const sendEmailJSEmail = async (toEmail, toName, title, messageBody) => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
    console.log('[DRY RUN] Email JS Missing Credentials (Did you add your Private Key?). Email Body:', messageBody);
    return;
  }

  try {
    const payload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      template_params: {
        name: toName,
        email: toEmail,
        reply_to: 'no-reply@bakerycms.com',
        title: title,
        message: messageBody,
        to_name: toName
      }
    };

    // Node 18+ has built-in fetch
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`Email successfully sent to ${toEmail}`);
    } else {
      const errorText = await response.text();
      console.error('Failed to send email:', errorText);
    }
  } catch (error) {
    console.error('EmailJS request error:', error);
  }
};

export const sendOrderCreatedEmailToCustomer = async (orderId, trackingId, customer, cartItems, totalAmount) => {
  const itemDetails = cartItems.map(item => `- ${item.quantity}x ${item.name} (Rs. ${item.price_at_purchase})`).join('\n');
  const messageBody = `Thank you for your order!\n\nOrder ID: #${orderId}\nTracking ID: ${trackingId}\n\nItems:\n${itemDetails}\n\nTotal: Rs. ${totalAmount}\n\nWe have received your order and it is currently Pending. You can track your order using your Tracking ID on our website.`;

  await sendEmailJSEmail(customer.email, customer.name, `Order Received - #${orderId}`, messageBody);
};

export const sendOrderConfirmationToCustomer = async (order) => {
  const messageBody = `Great news! Your Bakery order #${order.id} has been CONFIRMED.\n\nTotal: Rs. ${order.total_amount}\nTracking ID: ${order.tracking_id}\n\nWe will process it shortly!`;

  await sendEmailJSEmail(order.customer_email, order.customer_name, `Your Order #${order.id} is Confirmed!`, messageBody);
};

export const sendOrderCancellationToCustomer = async (order, notes) => {
  const noteSection = notes ? `\n\nAdmin Note: ${notes}` : '';
  const messageBody = `We're sorry, but your Bakery order #${order.id} has been CANCELLED.${noteSection}\n\nTotal: Rs. ${order.total_amount}\nTracking ID: ${order.tracking_id}\n\nPlease contact us if you have any questions.`;

  await sendEmailJSEmail(order.customer_email, order.customer_name, `Your Order #${order.id} has been Cancelled`, messageBody);
};
