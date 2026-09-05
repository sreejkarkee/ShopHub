import { Router } from 'express';
import { adminStats, createOrder, retailerSales } from '../controllers/orderController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
router.post('/', protect, requireRole('customer'), createOrder);
router.get('/my-sales', protect, requireRole('retailer'), retailerSales);
router.get('/admin-stats', protect, requireRole('admin'), adminStats);

export default router;
