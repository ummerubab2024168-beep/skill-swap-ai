import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  availability: { type: String, default: "Available" },
  skills: [{ type: String }],
  experience: [{
    role: { type: String, default: "" },
    company: { type: String, default: "" }
  }]
}, { timestamps: true });

// Yahan next() wala jhanjhat khatam, simple async function
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.models.User || mongoose.model('User', UserSchema);