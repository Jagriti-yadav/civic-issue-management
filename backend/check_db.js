import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`Total users in database: ${userCount}`);

    if (userCount > 0) {
      const users = await usersCollection.find({}).toArray();
      console.log('Users:');
      users.forEach(user => {
        console.log(`- ${user.email} (${user.name}) - Role: ${user.role} - Active: ${user.isActive}`);
      });
    } else {
      console.log('No users found in database');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkDatabase();
