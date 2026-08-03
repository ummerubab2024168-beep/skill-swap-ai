// models/Skill.js
import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: [true, 'Skill title is required'],
    trim: true 
  },
  description: { 
    type: String, 
    default: ""
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    trim: true,
    index: true 
  },
  proficiencyLevel: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Expert'], 
    default: 'Beginner' 
  },
  isSwapAvailable: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

// Export the model
export default mongoose.models.Skill || mongoose.model('Skill', skillSchema);