import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  }],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['placed', 'fulfilled', 'cancelled'], default: 'placed' },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
