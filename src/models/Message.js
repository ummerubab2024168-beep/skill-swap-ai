import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: [true, 'Message content cannot be empty'],
    trim: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);