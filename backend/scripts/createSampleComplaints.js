import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const createSampleComplaints = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Find the department head user
    const deptHead = await User.findOne({ email: 'dept.head@smartcivic.com' });
    if (!deptHead) {
      console.log('Department Head not found. Please create it first.');
      process.exit(1);
    }

    // Find a citizen user to submit complaints
    const citizen = await User.findOne({ role: 'citizen' });
    if (!citizen) {
      console.log('No citizen user found. Creating one...');
      const newCitizen = await User.create({
        name: 'Test Citizen',
        email: 'citizen@test.com',
        password: 'Citizen123',
        role: 'citizen',
        phone: '+1234567890',
        isActive: true
      });
      console.log('Citizen created:', newCitizen.email);
    }

    const submitter = citizen || await User.findOne({ role: 'citizen' });

    // Create sample complaints for Sanitation department
    const sampleComplaints = [
      {
        title: 'Garbage collection missed',
        description: 'Garbage collection was missed this week on Main Street',
        category: 'sanitation',
        priority: 'high',
        status: 'pending',
        department: 'Sanitation',
        phoneNumber: '+1234567890',
        submittedBy: submitter._id,
        location: {
          address: '123 Main Street'
        }
      },
      {
        title: 'Overflowing trash bin',
        description: 'Public trash bin at City Park is overflowing',
        category: 'sanitation',
        priority: 'medium',
        status: 'assigned',
        department: 'Sanitation',
        phoneNumber: '+1234567890',
        submittedBy: submitter._id,
        location: {
          address: 'City Park'
        }
      },
      {
        title: 'Sewage backup reported',
        description: 'Sewage backup reported in residential area',
        category: 'sanitation',
        priority: 'critical',
        status: 'in_progress',
        department: 'Sanitation',
        phoneNumber: '+1234567890',
        submittedBy: submitter._id,
        location: {
          address: '456 Residential Ave'
        }
      },
      {
        title: 'Street cleaning needed',
        description: 'Street needs cleaning after recent event',
        category: 'sanitation',
        priority: 'low',
        status: 'resolved',
        department: 'Sanitation',
        phoneNumber: '+1234567890',
        submittedBy: submitter._id,
        location: {
          address: '789 Event Blvd'
        },
        resolutionEvidence: {
          text: 'Street cleaned successfully',
          resolvedAt: new Date()
        }
      },
      {
        title: 'Dead animal removal',
        description: 'Dead animal needs to be removed from roadside',
        category: 'sanitation',
        priority: 'medium',
        status: 'pending',
        department: 'Sanitation',
        phoneNumber: '+1234567890',
        submittedBy: submitter._id,
        location: {
          address: '321 Highway Road'
        }
      }
    ];

    const createdComplaints = [];
    for (const complaintData of sampleComplaints) {
      const complaint = await Complaint.create(complaintData);
      createdComplaints.push(complaint);
      console.log(`Created complaint: ${complaint.complaintId} - ${complaint.title}`);
    }

    console.log('\n=== Sample Complaints Created ===');
    console.log(`Total: ${createdComplaints.length}`);
    console.log(`Department: Sanitation`);
    console.log('===================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createSampleComplaints();
