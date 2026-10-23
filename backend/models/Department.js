import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  departmentId: {
    type: String,
    required: false,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  indexes: [
    { name: 1 },
    { isActive: 1 }
  ]
});

// Generate department ID before saving
departmentSchema.pre('save', async function() {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Department').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.departmentId = `DEPT-${year}-${String(count + 1).padStart(3, '0')}`;
  }
});

const Department = mongoose.model('Department', departmentSchema);

export default Department;
