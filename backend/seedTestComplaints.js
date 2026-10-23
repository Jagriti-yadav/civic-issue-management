import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Complaint from './models/Complaint.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const seedComplaints = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartcivic');
    console.log('Connected to MongoDB');

    // Get existing users
    const users = await User.find();
    console.log(`Found ${users.length} users`);

    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      process.exit(1);
    }

    const citizen = users.find(u => u.role === 'citizen') || users[0];
    const officers = users.filter(u => u.role === 'officer');

    // If no officers, create some for testing
    let officerList = officers;
    if (officers.length === 0) {
      console.log('No officers found, creating test officers...');
      const newOfficer = await User.create({
        name: 'Test Officer 1',
        email: 'officer1@test.com',
        password: 'officer123',
        role: 'officer',
        department: 'Public Works'
      });
      const newOfficer2 = await User.create({
        name: 'Test Officer 2',
        email: 'officer2@test.com',
        password: 'officer123',
        role: 'officer',
        department: 'Water Department'
      });
      officerList = [newOfficer, newOfficer2];
    }

    console.log(`Found ${officerList.length} officers`);

    // Generate test complaints with different dates
    const now = new Date();
    const testComplaints = [];

    const categories = ['roads', 'water', 'electricity', 'sanitation', 'public_safety', 'other'];
    const departments = ['Public Works', 'Water Department', 'Electricity Board', 'Sanitation Department', 'Police Department', 'General Administration'];
    const statuses = ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'];
    const priorities = ['low', 'medium', 'high', 'critical'];

    // Create complaints over the last 90 days
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysAgo);

      // Weight status to have more resolved complaints for testing
      const statusWeights = [0.15, 0.15, 0.15, 0.40, 0.15]; // pending, assigned, in_progress, resolved, rejected
      const randomNum = Math.random();
      let statusIndex = 0;
      let cumulative = 0;
      for (let j = 0; j < statusWeights.length; j++) {
        cumulative += statusWeights[j];
        if (randomNum <= cumulative) {
          statusIndex = j;
          break;
        }
      }
      const status = statuses[statusIndex];

      const category = categories[Math.floor(Math.random() * categories.length)];
      const department = departments[categories.indexOf(category)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const assignedOfficer = officerList[Math.floor(Math.random() * officerList.length)];

      const complaint = {
        complaintId: `TEST-${Date.now()}-${i}`, // Unique ID
        title: `Test Complaint ${i + 1} - ${category.replace('_', ' ').toUpperCase()}`,
        description: `This is a test complaint for ${category} with ${priority} priority.`,
        category,
        priority,
        status,
        location: {
          address: `Test Address ${i + 1}`,
          latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
          longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
          landmark: `Landmark ${i + 1}`
        },
        phoneNumber: '+1234567890',
        images: [],
        submittedBy: citizen._id,
        assignedTo: assignedOfficer._id, // Randomly assign to an officer
        department,
        remarks: [],
        statusHistory: [{
          status,
          changedBy: assignedOfficer._id,
          timestamp: createdAt,
          note: 'Initial status'
        }],
        createdAt,
        updatedAt: createdAt
      };

      // Add resolution evidence for resolved complaints
      if (status === 'resolved') {
        const resolvedAt = new Date(createdAt);
        resolvedAt.setDate(resolvedAt.getDate() + Math.floor(Math.random() * 7) + 1);
        complaint.resolutionEvidence = {
          text: 'Issue has been resolved',
          images: [],
          resolvedAt
        };
        complaint.updatedAt = resolvedAt;
        complaint.statusHistory.push({
          status: 'resolved',
          changedBy: assignedOfficer._id,
          timestamp: resolvedAt,
          note: 'Complaint resolved'
        });
      }

      testComplaints.push(complaint);
    }

    // Clear existing complaints
    await Complaint.deleteMany({});
    console.log('Cleared existing complaints');

    // Insert test complaints
    await Complaint.insertMany(testComplaints);
    console.log(`Inserted ${testComplaints.length} test complaints`);

    // Verify insertion
    const count = await Complaint.countDocuments();
    console.log(`Total complaints in database: ${count}`);

    // Show status breakdown
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('\nStatus breakdown:');
    statusCounts.forEach(item => {
      console.log(`- ${item._id}: ${item.count}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedComplaints();
