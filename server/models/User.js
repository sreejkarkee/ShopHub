import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'retailer'], required: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);