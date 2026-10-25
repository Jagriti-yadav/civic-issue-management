import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: false,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['roads', 'water', 'electricity', 'sanitation', 'public_safety', 'other']
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  location: {
    address: String,
    latitude: Number,
    longitude: Number,
    landmark: String
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Validate phone number with country code support
        // Accepts formats: +1234567890, +1 234 567 890, etc.
        return /^\+?[1-9]\d{1,14}$/.test(v.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Please provide a valid phone number with country code'
    }
  },
  images: [String],
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  department: {
    type: String,
    required: true
  },
  remarks: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  resolutionEvidence: {
    text: String,
    images: [String],
    resolvedAt: Date
  },
  aiClassification: {
    category: String,
    priority: String,
    confidence: Number
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    comment: {
      type: String,
      required: false
    },
    submittedAt: {
      type: Date,
      required: false
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  }
}, {
  timestamps: true,
  indexes: [
    { complaintId: 1 },
    { submittedBy: 1, createdAt: -1 },
    { assignedTo: 1, status: 1 },
    { department: 1, status: 1 },
    { status: 1, createdAt: -1 },
    { category: 1 },
    { priority: 1 }
  ]
});

// Generate complaint ID before saving
complaintSchema.pre('save', async function() {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Complaint').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.complaintId = `CMP-${year}-${String(count + 1).padStart(3, '0')}`;
  }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;