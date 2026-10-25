import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const createTestNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_civic');
    console.log('Connected to MongoDB');

    // Get the Department Head user
    const deptHead = await User.findOne({ email: 'dept.head@smartcivic.com' });
    if (!deptHead) {
      console.log('Department Head not found');
      process.exit(1);
    }

    // Get a test complaint
    const complaint = await Complaint.findOne({ department: 'Sanitation' });
    if (!complaint) {
      console.log('No complaint found for Sanitation department');
      process.exit(1);
    }

    // Create test notifications
    const notifications = [
      {
        recipient: deptHead._id,
        title: 'New Complaint Submitted',
        message: `A new complaint "${complaint.title}" has been submitted to your department`,
        type: 'complaint_submitted',
        relatedComplaint: complaint._id,
        isRead: false
      },
      {
        recipient: deptHead._id,
        title: 'Complaint Assigned',
        message: `Complaint "${complaint.title}" has been assigned to an officer`,
        type: 'complaint_assigned',
        relatedComplaint: complaint._id,
        isRead: false
      },
      {
        recipient: deptHead._id,
        title: 'System Update',
        message: 'Department Head Portal is now available',
        type: 'general',
        isRead: true
      }
    ];

    for (const notifData of notifications) {
      const existing = await Notification.findOne({
        recipient: notifData.recipient,
        title: notifData.title
      });
      if (!existing) {
        await Notification.create(notifData);
        console.log(`Created notification: ${notifData.title}`);
      } else {
        console.log(`Notification already exists: ${notifData.title}`);
      }
    }

    console.log('\n=== Test Notifications Created ===');
    console.log('Department Head:', deptHead.email);
    console.log('==============================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createTestNotifications();
