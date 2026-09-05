import Product from '../models/Product.js';

export const listProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Unable to load products' });
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
