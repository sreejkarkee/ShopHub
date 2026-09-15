import mongoose from 'mongoose';

const shipmentEnum = ['placed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    shipmentStatus: { type: String, enum: shipmentEnum, default: 'placed' },
  }],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: [...shipmentEnum, 'fulfilled'], default: 'placed' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentRef: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
