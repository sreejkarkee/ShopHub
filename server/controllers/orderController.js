import Order from '../models/Order.js';
import Product from '../models/Product.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Stock given to legacy products created before stock tracking existed.
const LEGACY_STOCK = 10;

const NEXT_STATUS = {
  placed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

function deriveOrderStatus(items) {
  if (items.length && items.every((i) => i.shipmentStatus === 'delivered')) return 'delivered';
  if (items.length && items.every((i) => i.shipmentStatus === 'cancelled')) return 'cancelled';
  if (items.some((i) => i.shipmentStatus === 'out_for_delivery')) return 'out_for_delivery';
  if (items.some((i) => i.shipmentStatus === 'shipped')) return 'shipped';
  return 'placed';
}

export const createOrder = async (req, res) => {
  const rawItems = Array.isArray(req.body.items)
    ? req.body.items
    : Array.isArray(req.body.productIds)
      ? req.body.productIds.map((productId) => ({ productId, quantity: 1 }))
      : [];

  if (!rawItems.length) {
    return res.status(400).json({ message: 'Your cart is empty' });
  }

  const orderItems = rawItems.map((entry) => ({
    productId: typeof entry === 'string' ? entry : entry.productId || entry._id,
    quantity: Math.max(1, Number(entry.quantity || 1)),
  })).filter((entry) => entry.productId);

  if (orderItems.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty' });
  }

  const claimedItems = [];
  try {
    const products = await Product.find({ _id: { $in: orderItems.map((item) => item.productId) } });
    const productMap = new Map(products.map((product) => [String(product._id), product]));

    const missingProducts = orderItems.filter((item) => !productMap.has(String(item.productId)));
    if (missingProducts.length) {
      return res.status(400).json({ message: 'One or more products are unavailable' });
    }

    for (const item of orderItems) {
      const product = productMap.get(String(item.productId));
      // Self-heal legacy products created before stock tracking existed.
      if (product.quantity == null) {
        product.quantity = LEGACY_STOCK;
        await Product.updateOne({ _id: product._id }, { $set: { quantity: LEGACY_STOCK } });
      }
      const stock = Number(product.quantity || 0);
      if (product.soldOut || stock <= 0) {
        return res.status(400).json({ message: `"${product.name}" is sold out` });
      }
      if (stock < item.quantity) {
        return res.status(400).json({ message: `Only ${stock} left of "${product.name}"` });
      }

      const claimFilter = {
        _id: item.productId,
        soldOut: { $ne: true },
        quantity: { $gte: item.quantity },
      };
      const claimUpdate = {
        $inc: { quantity: -item.quantity },
        $set: { soldOut: stock - item.quantity <= 0 },
      };
      let claimedProduct = await Product.findOneAndUpdate(claimFilter, claimUpdate, { returnDocument: 'after' });
      if (!claimedProduct) {
        // Legacy docs may lack the quantity field in storage even though the
        // schema default masks it in memory — normalize, then retry once.
        await Product.updateOne(
          { _id: item.productId, quantity: { $exists: false }, soldOut: { $ne: true } },
          { $set: { quantity: LEGACY_STOCK } },
        );
        claimedProduct = await Product.findOneAndUpdate(
          claimFilter,
          {
            $inc: { quantity: -item.quantity },
            // Stock was just normalized to LEGACY_STOCK above, so base soldOut on that.
            $set: { soldOut: LEGACY_STOCK - item.quantity <= 0 },
          },
          { returnDocument: 'after' },
        );
      }
      if (!claimedProduct) throw new Error('Product is no longer available');
      claimedItems.push({ productId: claimedProduct._id, quantity: item.quantity });
    }

    const items = orderItems.map((item) => {
      const product = productMap.get(String(item.productId));
      return {
        product: product._id,
        retailer: product.retailer,
        productName: product.name,
        amount: product.price,
        quantity: item.quantity,
        shipmentStatus: 'placed',
      };
    });
    const total = items.reduce((sum, item) => sum + (Number(item.amount) * Number(item.quantity)), 0);
    const order = await Order.create({
      customer: req.user.id,
      items,
      total,
      status: 'placed',
      paymentStatus: 'pending',
    });
    res.status(201).json(order);
  } catch (error) {
    if (claimedItems.length) {
      await Promise.all(claimedItems.map(({ productId, quantity }) => Product.findByIdAndUpdate(
        productId,
        { $inc: { quantity }, $set: { soldOut: false } },
      )));
    }
    const conflict = error.message === 'Product is no longer available';
    res.status(conflict ? 409 : 400).json({ message: conflict ? 'Stock just ran out for one of these products. Please try again.' : 'Order could not be placed' });
  }
};

export const customerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Unable to load purchases' });
  }
};

// Mock payment: simulates a bank transfer with a short delay, then marks the order paid.
// No real money moves — optional { bank, accountNo } is stored only as a masked reference.
export const payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your order' });
    }
    if (order.paymentStatus === 'paid') return res.json(order);

    const bank = String(req.body?.bank || 'Mock Bank').slice(0, 40);
    const digits = String(req.body?.accountNo || '').replace(/\D/g, '');
    const last4 = digits.slice(-4).padStart(4, '•');

    await delay(1200);
    order.paymentStatus = 'paid';
    order.paymentRef = `mock_${bank.split(' ')[1] || 'bank'}_${last4}_${Date.now()}`;
    await order.save();
    res.json(order);
  } catch {
    res.status(400).json({ message: 'Payment failed, please try again' });
  }
};

export const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Unable to load orders' });
  }
};

export const updateShipmentStatus = async (req, res) => {
  const { orderId, itemId } = req.params;
  const { shipmentStatus } = req.body;
  const allowed = ['shipped', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!allowed.includes(shipmentStatus)) {
    return res.status(400).json({ message: 'Invalid shipment status' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const item = order.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (!item.retailer || item.retailer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your sale' });
    }
    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Order is not paid yet' });
    }
    const validNext = NEXT_STATUS[item.shipmentStatus] || [];
    if (!validNext.includes(shipmentStatus)) {
      return res.status(400).json({ message: `Cannot move from ${item.shipmentStatus} to ${shipmentStatus}` });
    }
    item.shipmentStatus = shipmentStatus;
    order.status = deriveOrderStatus(order.items);
    await order.save();
    res.json(order);
  } catch {
    res.status(400).json({ message: 'Could not update shipment status' });
  }
};

export const retailerSales = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.retailer': req.user.id }).sort({ createdAt: -1 });
    const sales = orders.flatMap((order) => order.items
      .filter((item) => item.retailer && item.retailer.toString() === req.user.id)
      .map((item) => ({
        _id: `${order._id}-${item._id}`,
        orderId: order._id,
        itemId: item._id,
        productName: item.productName,
        amount: Number(item.amount) * Number(item.quantity || 1),
        quantity: item.quantity || 1,
        status: order.status,
        shipmentStatus: item.shipmentStatus || 'placed',
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      })));
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
