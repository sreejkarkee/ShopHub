import { Router } from 'express';
import { createProduct, listProducts } from '../controllers/productController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/', listProducts);
router.post('/', protect, requireRole('retailer'), createProduct);

export default router;
