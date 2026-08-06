import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    maxlength: 300
  }
}, { timestamps: true });
ReviewSchema.index(
  { reviewer: 1, reviewee: 1 },
  { unique: true }
);
export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);