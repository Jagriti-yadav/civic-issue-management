import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const checkComplaints = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartcivic');
    console.log('Connected to MongoDB');

    const Complaint = mongoose.model('Complaint', new mongoose.Schema({}, { strict: false }), 'complaints');

    const complaints = await Complaint.find().lean();
    console.log(`\nTotal complaints in database: ${complaints.length}`);

    if (complaints.length > 0) {
      console.log('\nSample complaints:');
      complaints.slice(0, 5).forEach(c => {
        console.log(`- ID: ${c.complaintId || 'N/A'}`);
        console.log(`  Title: ${c.title}`);
        console.log(`  Status: ${c.status}`);
        console.log(`  Category: ${c.category}`);
        console.log(`  Department: ${c.department}`);
        console.log(`  Created: ${c.createdAt}`);
        console.log(`  Resolved At: ${c.resolutionEvidence?.resolvedAt || 'N/A'}`);
        console.log(`  Assigned To: ${c.assignedTo || 'N/A'}`);
        console.log('');
      });

      // Status breakdown
      const statusCounts = {};
      complaints.forEach(c => {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      });
      console.log('\nStatus breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`- ${status}: ${count}`);
      });
    } else {
      console.log('No complaints found in database.');
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkComplaints();
