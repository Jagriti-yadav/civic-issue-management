import User from './models/User.js';
import connectDB from './config/db.js';

async function testUserManagement() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('\n--- Testing User Management ---\n');

    // Count all users
    const totalUsers = await User.countDocuments();
    console.log(`Total users in database: ${totalUsers}`);

    // Get all users with their roles
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    console.log(`\nFound ${users.length} users:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   Registered: ${user.createdAt}`);
      console.log('');
    });

    // Count by role
    const citizens = await User.countDocuments({ role: 'citizen' });
    const officers = await User.countDocuments({ role: 'officer' });
    const deptHeads = await User.countDocuments({ role: 'department_head' });
    const admins = await User.countDocuments({ role: 'super_admin' });

    console.log('\n--- User Statistics ---');
    console.log(`Citizens: ${citizens}`);
    console.log(`Officers: ${officers}`);
    console.log(`Department Heads: ${deptHeads}`);
    console.log(`Super Admins: ${admins}`);

    // Count by status
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    console.log(`\nActive Users: ${activeUsers}`);
    console.log(`Inactive Users: ${inactiveUsers}`);

    console.log('\n--- Test Complete ---');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testUserManagement();
