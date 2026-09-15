import { Router } from 'express';
import { adminOrders, adminStats, createOrder, myOrders, payOrder, retailerSales, updateShipmentStatus } from '../controllers/orderController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
router.post('/', protect, requireRole('customer'), createOrder);
router.post('/:id/pay', protect, requireRole('customer'), payOrder);
router.get('/my-orders', protect, requireRole('customer'), myOrders);
router.get('/my-sales', protect, requireRole('retailer'), retailerSales);
router.patch('/:orderId/items/:itemId/shipment', protect, requireRole('retailer'), updateShipmentStatus);
router.get('/admin-stats', protect, requireRole('admin'), adminStats);
router.get('/admin-orders', protect, requireRole('admin'), adminOrders);

export default router;
