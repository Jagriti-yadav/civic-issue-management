import User from '../models/User.js';
import Department from '../models/Department.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const createDepartmentHead = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if department exists
    let department = await Department.findOne({ name: 'Sanitation' });
    if (!department) {
      console.log('Creating Sanitation department...');
      department = await Department.create({
        name: 'Sanitation',
        description: 'Sanitation Department',
        isActive: true
      });
      console.log('Department created:', department.name);
    } else {
      console.log('Department already exists:', department.name);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'dept.head@smartcivic.com' });
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      console.log('Current role:', existingUser.role);
      console.log('Current isActive:', existingUser.isActive);

      // Update the user if needed
      if (existingUser.role !== 'department_head') {
        existingUser.role = 'department_head';
        existingUser.department = 'Sanitation';
        existingUser.isActive = true;
        await existingUser.save();
        console.log('User updated to department_head role');
      }
    } else {
      // Create new department head
      const deptHead = await User.create({
        name: 'Department Head',
        email: 'dept.head@smartcivic.com',
        password: 'DeptHead123', // Will be hashed automatically
        role: 'department_head',
        department: 'Sanitation',
        designation: 'Senior Manager',
        phone: '+1234567890',
        isActive: true
      });

      console.log('\n=== Department Head Created Successfully ===');
      console.log('Email:', deptHead.email);
      console.log('Password: DeptHead123');
      console.log('Role:', deptHead.role);
      console.log('Department:', deptHead.department);
      console.log('Designation:', deptHead.designation);
      console.log('isActive:', deptHead.isActive);
      console.log('=========================================\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createDepartmentHead();
