import User from '../models/User.js';
import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const createTestOfficers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_civic');
    console.log('Connected to MongoDB');

    // Get the Sanitation department
    const department = await Department.findOne({ name: 'Sanitation' });
    if (!department) {
      console.log('Sanitation department not found. Creating it...');
      await Department.create({
        name: 'Sanitation',
        description: 'Sanitation Department',
        isActive: true
      });
      console.log('Sanitation department created');
    }

    // Create test officers for Sanitation department
    const officers = [
      {
        name: 'John Officer',
        email: 'john.officer@smartcivic.com',
        password: 'Officer123',
        role: 'officer',
        department: 'Sanitation',
        designation: 'Sanitation Inspector',
        phone: '+1234567890',
        isActive: true
      },
      {
        name: 'Jane Officer',
        email: 'jane.officer@smartcivic.com',
        password: 'Officer123',
        role: 'officer',
        department: 'Sanitation',
        designation: 'Field Officer',
        phone: '+1234567891',
        isActive: true
      },
      {
        name: 'Bob Officer',
        email: 'bob.officer@smartcivic.com',
        password: 'Officer123',
        role: 'officer',
        department: 'Sanitation',
        designation: 'Senior Inspector',
        phone: '+1234567892',
        isActive: true
      }
    ];

    for (const officerData of officers) {
      const existing = await User.findOne({ email: officerData.email });
      if (existing) {
        console.log(`Officer already exists: ${existing.email}`);
      } else {
        const officer = await User.create(officerData);
        console.log(`Created officer: ${officer.email} (${officer.department})`);
      }
    }

    // Create a test citizen
    const citizen = await User.findOne({ email: 'citizen@smartcivic.com' });
    if (!citizen) {
      await User.create({
        name: 'Test Citizen',
        email: 'citizen@smartcivic.com',
        password: 'Citizen123',
        role: 'citizen'
      });
      console.log('Created test citizen: citizen@smartcivic.com / Citizen123');
    }

    // Create a test complaint assigned to John Officer
    const officer = await User.findOne({ email: 'john.officer@smartcivic.com' });
    const testCitizen = await User.findOne({ email: 'citizen@smartcivic.com' });
    
    if (officer && testCitizen) {
      const existingComplaint = await Complaint.findOne({ title: 'Test Sanitation Issue' });
      if (!existingComplaint) {
        await Complaint.create({
          title: 'Test Sanitation Issue',
          description: 'A test complaint for the Sanitation department',
          category: 'sanitation',
          priority: 'medium',
          status: 'assigned',
          location: { address: '123 Main St' },
          phoneNumber: '+1234567890',
          submittedBy: testCitizen._id,
          assignedTo: officer._id,
          department: 'Sanitation'
        });
        console.log('Created test complaint assigned to John Officer');
      }
    }

    console.log('\n=== Test Data Created ===');
    console.log('Department Head: dept.head@smartcivic.com / DeptHead123');
    console.log('John Officer: john.officer@smartcivic.com / Officer123');
    console.log('Jane Officer: jane.officer@smartcivic.com / Officer123');
    console.log('Bob Officer: bob.officer@smartcivic.com / Officer123');
    console.log('Citizen: citizen@smartcivic.com / Citizen123');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createTestOfficers();
