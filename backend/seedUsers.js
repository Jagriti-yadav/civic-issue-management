import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  role: {
    type: String,
    enum: ['citizen', 'officer', 'department_head', 'super_admin'],
    default: 'citizen'
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  department: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartcivic');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    const users = [
      {
        name: 'Citizen User',
        email: 'citizen@test.com',
        password: 'citizen123',
        role: 'citizen'
      },
      {
        name: 'Officer User',
        email: 'officer@test.com',
        password: 'officer123',
        role: 'officer',
        department: 'Public Works'
      },
      {
        name: 'Department Head',
        email: 'depthead@test.com',
        password: 'depthead123',
        role: 'department_head',
        department: 'Public Works'
      },
      {
        name: 'Super Admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'super_admin'
      }
    ];

    for (const userData of users) {
      const user = await User.create(userData);
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    console.log('\n=== Test Credentials ===');
    console.log('Citizen: citizen@test.com / citizen123');
    console.log('Officer: officer@test.com / officer123');
    console.log('Department Head: depthead@test.com / depthead123');
    console.log('Super Admin: admin@test.com / admin123');
    console.log('========================\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

seedUsers();
