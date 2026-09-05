import Product from '../models/Product.js';

export const listProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('retailer', 'name email role')
      .populate('reviews.user', 'name email')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Unable to load products' });
  }
};

export const listMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ retailer: req.user.id })
      .populate('retailer', 'name email role')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Unable to load your products' });
  }
};

export const addReview = async (req, res) => {
  const rating = Number(req.body.rating);
  const comment = req.body.comment?.trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment || comment.length > 1000) {
    return res.status(400).json({ message: 'Choose a rating from 1 to 5 and write a review under 1000 characters.' });
  }

  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.reviews.some((review) => String(review.user) === req.user.id)) {
      return res.status(409).json({ message: 'You have already reviewed this product.' });
    }

    product.reviews.push({ user: req.user.id, rating, comment });
    product.reviewCount = product.reviews.length;
    product.rating = Number((product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviewCount).toFixed(1));
    await product.save();
    await product.populate('reviews.user', 'name email');
    res.status(201).json({ product });
  } catch {
    res.status(400).json({ message: 'Review could not be added' });
  }
};

export const createProduct = async (req, res) => {
  const { name, price, description, category = 'Essentials', imageUrl = '' } = req.body;
  if (!name?.trim() || !description?.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ message: 'Name, description, and a valid price are required' });
  }

  try {
    const product = await Product.create({
      name: name.trim(), description: description.trim(), category, imageUrl,
      price: Number(price), retailer: req.user.role === 'admin' ? undefined : req.user.id,
    });
    res.status(201).json(product);
  } catch {
    res.status(400).json({ message: 'Product could not be created' });
  }
};

export const updateProduct = async (req, res) => {
  const { name, price, description, category = 'Essentials', imageUrl = '' } = req.body;
  if (!name?.trim() || !description?.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ message: 'Name, description, and a valid price are required' });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), price: Number(price), description: description.trim(), category, imageUrl },
      { new: true, runValidators: true },
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.populate('retailer', 'name email role');
    res.json(product);
  } catch {
    res.status(400).json({ message: 'Product could not be updated' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch {
    res.status(400).json({ message: 'Product could not be deleted' });
  }
};
