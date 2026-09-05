import { Router } from 'express';
import { adminOrders, adminStats, createOrder, customerOrders, retailerSales } from '../controllers/orderController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
router.post('/', protect, requireRole('customer'), createOrder);
router.get('/my-orders', protect, requireRole('customer'), customerOrders);
router.get('/my-sales', protect, requireRole('retailer'), retailerSales);
router.get('/admin-stats', protect, requireRole('admin'), adminStats);
router.get('/admin-orders', protect, requireRole('admin'), adminOrders);

export default router;
