import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Complaint from './models/Complaint.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const checkResolved = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartcivic');
    console.log('Connected to MongoDB');

    const resolved = await Complaint.find({ status: 'resolved' }).lean();
    console.log(`\nTotal resolved complaints: ${resolved.length}`);

    if (resolved.length > 0) {
      console.log('\nSample resolved complaints:');
      resolved.slice(0, 5).forEach(c => {
        console.log(`- ID: ${c.complaintId}`);
        console.log(`  Created: ${c.createdAt}`);
        console.log(`  Resolved At: ${c.resolutionEvidence?.resolvedAt || 'N/A'}`);
        console.log('');
      });
    }

    const inProgress = await Complaint.find({ status: 'in_progress' }).countDocuments();
    const pending = await Complaint.find({ status: 'pending' }).countDocuments();
    const assigned = await Complaint.find({ status: 'assigned' }).countDocuments();

    console.log('\nStatus counts:');
    console.log(`- Resolved: ${resolved.length}`);
    console.log(`- In Progress: ${inProgress}`);
    console.log(`- Pending: ${pending}`);
    console.log(`- Assigned: ${assigned}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkResolved();
