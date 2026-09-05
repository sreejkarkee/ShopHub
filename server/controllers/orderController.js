import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const createOrder = async (req, res) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty' });
  }

  const claimedIds = [];
  try {
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length || products.some((product) => product.soldOut)) {
      return res.status(400).json({ message: 'One or more products are unavailable' });
    }

    for (const productId of productIds) {
      const claimedProduct = await Product.findOneAndUpdate(
        { _id: productId, soldOut: { $ne: true } },
        { $set: { soldOut: true } },
        { new: true },
      );
      if (!claimedProduct) throw new Error('Product is no longer available');
      claimedIds.push(claimedProduct._id);
    }

    const items = products.map((product) => ({
      product: product._id,
      retailer: product.retailer,
      productName: product.name,
      amount: product.price,
    }));
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    const order = await Order.create({ customer: req.user.id, items, total });
    res.status(201).json(order);
  } catch (error) {
    if (claimedIds.length) await Product.updateMany({ _id: { $in: claimedIds } }, { $set: { soldOut: false } });
    res.status(error.message === 'Product is no longer available' ? 409 : 400).json({ message: 'Order could not be placed' });
  }
};

export const customerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 });
    const purchasedProducts = new Set();
    const uniqueOrders = orders.map((order) => {
      const orderData = order.toObject();
      orderData.items = orderData.items.filter((item) => {
        const productId = String(item.product);
        if (purchasedProducts.has(productId)) return false;
        purchasedProducts.add(productId);
        return true;
      });
      orderData.total = orderData.items.reduce((sum, item) => sum + item.amount, 0);
      return orderData;
    }).filter((order) => order.items.length);
    res.json(uniqueOrders);
  } catch {
    res.status(500).json({ message: 'Unable to load purchases' });
  }
};

export const retailerSales = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.retailer': req.user.id }).sort({ createdAt: -1 });
    const sales = orders.flatMap((order) => order.items
      .filter((item) => item.retailer.toString() === req.user.id)
      .map((item) => ({ _id: `${order._id}-${item._id}`, productName: item.productName, amount: item.amount, status: order.status })));
    res.json(sales);
  } catch {
    res.status(500).json({ message: 'Unable to load sales' });
  }
};

export const adminStats = async (req, res) => {
  try {
    const result = await Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, totalSales: { $sum: '$total' } } }]);
    res.json({ totalSales: result[0]?.totalSales || 0 });
  } catch {
    res.status(500).json({ message: 'Unable to load stats' });
  }
};

export const adminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    const purchases = orders.flatMap((order) => order.items.map((item) => ({
      _id: `${order._id}-${item._id}`,
      orderId: order._id,
      customer: order.customer,
      productName: item.productName,
      amount: item.amount,
      status: order.status,
      createdAt: order.createdAt,
    })));
    res.json(purchases);
  } catch {
    res.status(500).json({ message: 'Unable to load purchase history' });
  }
};
