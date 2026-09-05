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
app.use(cors());
app.use(express.json());

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