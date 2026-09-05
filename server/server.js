import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login } from './controllers/authController.js';
import dbConnection from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { adminStats } from './controllers/orderController.js';
import { protect, requireRole } from './middleware/auth.js';

dotenv.config();

const app = express();
const allowedOrigins = process.env.CLIENT_URL?.split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect to database
dbConnection();

// Routes
app.post('/api/register', register);
app.post('/api/login', login);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.get('/api/admin/stats', protect, requireRole('admin'), adminStats);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));