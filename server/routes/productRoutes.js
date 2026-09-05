import { Router } from 'express';
import { addReview, createProduct, deleteProduct, listMyProducts, listProducts, updateProduct } from '../controllers/productController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/', listProducts);
router.get('/mine', protect, requireRole('retailer'), listMyProducts);
router.post('/', protect, requireRole(['retailer', 'admin']), createProduct);
router.put('/:id', protect, requireRole('admin'), updateProduct);
router.delete('/:id', protect, requireRole('admin'), deleteProduct);
router.post('/:productId/reviews', protect, requireRole('customer'), addReview);

export default router;
