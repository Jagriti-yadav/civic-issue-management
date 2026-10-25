import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import mongoose from 'mongoose';

// Create officer account (super_admin only)
export const createOfficer = async (req, res) => {
  try {
    const { name, email, password, department, designation, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and department are required'
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Validate department exists in Department model
    const dept = await Department.findOne({ name: department });
    if (!dept) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department. Please select a valid department.'
      });
    }

    // Check if department is active
    if (!dept.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Selected department is inactive. Please select an active department.'
      });
    }

    // Create officer
    const officerData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'officer',
      department: department.trim(),
      designation: designation ? designation.trim() : undefined,
      phone: phone ? phone.trim() : undefined
    };

    const officer = await User.create(officerData);

    res.status(201).json({
      success: true,
      message: 'Officer created successfully',
      officer: {
        id: officer._id,
        name: officer.name,
        email: officer.email,
        role: officer.role,
        department: officer.department,
        designation: officer.designation,
        phone: officer.phone,
        isActive: officer.isActive,
        createdAt: officer.createdAt
      }
    });
  } catch (error) {
    console.error('Create officer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create officer',
      error: error.message
    });
  }
};

// Get all officers with filters (super_admin only)
export const getOfficers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      department = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query - only officers
    const query = { role: 'officer' };

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.isActive = status === 'active';
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [officers, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      officers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get officers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch officers',
      error: error.message
    });
  }
};

// Update officer details (super_admin only)
export const updateOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, designation, phone } = req.body;

    const officer = await User.findById(id);
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found'
      });
    }

    // Verify user is an officer
    if (officer.role !== 'officer') {
      return res.status(400).json({
        success: false,
        message: 'User is not an officer'
      });
    }

    // Validate email if being changed
    if (email && email !== officer.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      officer.email = email.toLowerCase().trim();
    }

    // Validate department if being changed
    if (department && department !== officer.department) {
      const dept = await Department.findOne({ name: department });
      if (!dept) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department'
        });
      }

      // Check if department is active
      if (!dept.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Selected department is inactive'
        });
      }

      officer.department = department.trim();
    }

    if (name) {
      officer.name = name.trim();
    }

    if (designation !== undefined) {
      officer.designation = designation ? designation.trim() : undefined;
    }

    if (phone !== undefined) {
      officer.phone = phone ? phone.trim() : undefined;
    }

    await officer.save();

    res.status(200).json({
      success: true,
      message: 'Officer updated successfully',
      officer: {
        id: officer._id,
        name: officer.name,
        email: officer.email,
        role: officer.role,
        department: officer.department,
        designation: officer.designation,
        phone: officer.phone,
        isActive: officer.isActive,
        createdAt: officer.createdAt
      }
    });
  } catch (error) {
    console.error('Update officer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update officer',
      error: error.message
    });
  }
};

// Get complaints assigned to an officer (super_admin only)
export const getOfficerComplaints = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      status = '',
      priority = ''
    } = req.query;

    // Verify officer exists
    const officer = await User.findById(id).select('-password');
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found'
      });
    }

    // Verify user is an officer
    if (officer.role !== 'officer') {
      return res.status(400).json({
        success: false,
        message: 'User is not an officer'
      });
    }

    // Build query
    const query = { assignedTo: id };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('submittedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Complaint.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      officer: {
        id: officer._id,
        name: officer.name,
        email: officer.email,
        department: officer.department
      },
      complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get officer complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch officer complaints',
      error: error.message
    });
  }
};

// Get all users (super_admin only)
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      role = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.isActive = status === 'active';
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Update user status (activate/deactivate) - super_admin only
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent super_admin from deactivating themselves
    if (req.user.id === id.toString() && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// Get user's complaints
export const getUserComplaints = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      status = '',
      priority = ''
    } = req.query;

    // Verify user exists
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build query
    const query = { submittedBy: id };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Complaint.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user complaints',
      error: error.message
    });
  }
};

// Get all departments (for dropdowns - returns only active departments)
export const getDepartments = async (req, res) => {
  try {
    // Get active departments from Department model
    const departments = await Department.find({ isActive: true })
      .select('name')
      .sort({ name: 1 });

    const departmentNames = departments.map(dept => dept.name);

    res.status(200).json({
      success: true,
      departments: departmentNames
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message
    });
  }
};

// Get officers by department
export const getOfficersByDepartment = async (req, res) => {
  try {
    const { department } = req.params;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required'
      });
    }

    const officers = await User.find({
      role: 'officer',
      department: department,
      isActive: true
    }).select('name email department isActive createdAt');

    res.status(200).json({
      success: true,
      officers
    });
  } catch (error) {
    console.error('Get officers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch officers',
      error: error.message
    });
  }
};

// Get officers with workload for Department Head
export const getDepartmentOfficersWithWorkload = async (req, res) => {
  try {
    const { search = '', status = '' } = req.query;
    const department = req.user.department;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'No department assigned to your account. Please contact an administrator.'
      });
    }

    // Build query
    const query = {
      role: 'officer',
      department: department
    };

    // Apply search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply status filter
    if (status) {
      query.isActive = status === 'active';
    }

    // Get officers
    const officers = await User.find(query)
      .select('name email department designation phone isActive createdAt')
      .sort({ name: 1 });

    // Get workload counts for each officer
    const officerIds = officers.map(o => o._id);
    const workloadData = await Complaint.aggregate([
      {
        $match: {
          assignedTo: { $in: officerIds }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
        }
      }
    ]);

    // Create workload map
    const workloadMap = {};
    workloadData.forEach(item => {
      workloadMap[item._id.toString()] = {
        total: item.total,
        pending: item.pending,
        assigned: item.assigned,
        inProgress: item.inProgress,
        resolved: item.resolved
      };
    });

    // Merge workload data with officer data
    const officersWithWorkload = officers.map(officer => ({
      ...officer.toObject(),
      workload: workloadMap[officer._id.toString()] || {
        total: 0,
        pending: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0
      }
    }));

    res.status(200).json({
      success: true,
      officers: officersWithWorkload
    });
  } catch (error) {
    console.error('Get department officers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch officers',
      error: error.message
    });
  }
};

// Get officer details with assigned complaints for Department Head
export const getOfficerDetailsForDepartmentHead = async (req, res) => {
  try {
    const { id } = req.params;
    const department = req.user.department;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'No department assigned to your account'
      });
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid officer ID'
      });
    }

    // Get officer
    const officer = await User.findById(id).select('-password');

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found'
      });
    }

    // Verify officer belongs to the same department
    if (officer.department !== department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Officer is not in your department'
      });
    }

    // Verify officer role
    if (officer.role !== 'officer') {
      return res.status(400).json({
        success: false,
        message: 'User is not an officer'
      });
    }

    // Get assigned complaints
    const complaints = await Complaint.find({ assignedTo: id })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    // Calculate workload
    const workload = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      assigned: complaints.filter(c => c.status === 'assigned').length,
      inProgress: complaints.filter(c => c.status === 'in_progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length
    };

    res.status(200).json({
      success: true,
      officer: {
        ...officer.toObject(),
        workload
      },
      complaints
    });
  } catch (error) {
    console.error('Get officer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch officer details',
      error: error.message
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Security: Users can only view their own profile unless they are super_admin
    if (req.user.role !== 'super_admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own profile'
      });
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, department, designation, isActive } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Security: Users can only update their own profile unless they are super_admin
    if (req.user.role !== 'super_admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    // Security: Non-super_admin users cannot modify sensitive fields
    if (req.user.role !== 'super_admin') {
      // Prevent modifying role, department, designation, or isActive
      if (role || department || designation !== undefined || isActive !== undefined) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to modify these fields'
        });
      }
    }

    // Security: Super Admin cannot change their own role (prevent privilege escalation)
    if (role && req.user.role === 'super_admin' && req.user.id === id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    // Validate email if being changed
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone ? phone.trim() : undefined;
    }

    // Only super_admin can modify these fields
    if (req.user.role === 'super_admin') {
      if (role) user.role = role;
      if (department) user.department = department;
      if (designation !== undefined) user.designation = designation ? designation.trim() : undefined;
      if (isActive !== undefined) user.isActive = isActive;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Security: Users can only change their own password unless they are super_admin
    if (req.user.role !== 'super_admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'You can only change your own password'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Create Department Head account (super_admin only)
export const createDepartmentHead = async (req, res) => {
  try {
    const { name, email, password, department, designation, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and department are required'
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Validate department exists in Department model
    const dept = await Department.findOne({ name: department });
    if (!dept) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department. Please select a valid department.'
      });
    }

    // Check if department is active
    if (!dept.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Selected department is inactive. Please select an active department.'
      });
    }

    // Create department head
    const deptHeadData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'department_head',
      department: department.trim(),
      designation: designation ? designation.trim() : undefined,
      phone: phone ? phone.trim() : undefined
    };

    const deptHead = await User.create(deptHeadData);

    res.status(201).json({
      success: true,
      message: 'Department Head created successfully',
      departmentHead: {
        id: deptHead._id,
        name: deptHead.name,
        email: deptHead.email,
        role: deptHead.role,
        department: deptHead.department,
        designation: deptHead.designation,
        phone: deptHead.phone,
        isActive: deptHead.isActive,
        createdAt: deptHead.createdAt
      }
    });
  } catch (error) {
    console.error('Create department head error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create department head',
      error: error.message
    });
  }
};

// Create Super Admin account (super_admin only - for creating additional admins)
export const createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create super admin
    const adminData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'super_admin',
      phone: phone ? phone.trim() : undefined
    };

    const admin = await User.create(adminData);

    res.status(201).json({
      success: true,
      message: 'Super Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
        isActive: admin.isActive,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    console.error('Create super admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create super admin',
      error: error.message
    });
  }
};