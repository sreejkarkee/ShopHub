import { Router } from 'express';
import { createProduct, deleteProduct, listProducts, updateProduct } from '../controllers/productController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/', listProducts);
router.post('/', protect, requireRole(['retailer', 'admin']), createProduct);
router.put('/:id', protect, requireRole('admin'), updateProduct);
router.delete('/:id', protect, requireRole('admin'), deleteProduct);

export default router;
