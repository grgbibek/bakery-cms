import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { swaggerUi, swaggerSpec } from './swagger.js';
import config from './config/config.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import promoRoutes from './routes/promoRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for swagger/frontend if needed, or configure properly
}));
app.use(compression());
app.use(morgan('dev'));

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) and any localhost port in dev
    if (!origin || origin.startsWith('http://localhost') || origin === config.clientUrl) {
      callback(null, true);
    } else {
      callback(null, config.clientUrl === '*' ? true : origin === config.clientUrl);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));

// Static folder (for uploads) — allow cross-origin image loading from the frontend
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Serve public static files (if any)
app.use(express.static(path.join(__dirname, 'public')));

// Swagger Docs Route
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/promos', promoRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Bakery CMS API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 Handler (primarily for API)
app.use((req, res, next) => {
  res.status(404).json({ message: 'API Route not found' });
});


// 404 Handler (primarily for API)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: config.env === 'production' ? null : err.stack
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${config.env}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api/api-docs`);
});

