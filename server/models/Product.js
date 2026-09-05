import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, required: true, trim: true },
  category: { type: String, default: 'Essentials', trim: true },
  imageUrl: { type: String, default: '' },
  condition: { type: String, enum: ['New', 'Used'], default: 'New' },
  quality: { type: String, enum: ['New', 'Like New', 'Very Good', 'Good', 'Acceptable'], default: 'New' },
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
  reviews: { type: [reviewSchema], default: [] },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
