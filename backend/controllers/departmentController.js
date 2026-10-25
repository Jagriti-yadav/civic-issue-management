import Department from '../models/Department.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';

// Create department (super_admin only)
export const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required'
      });
    }

    // Check if department name already exists
    const existingDepartment = await Department.findOne({ name: name.trim() });
    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: 'Department name already exists'
      });
    }

    // Create department
    const departmentData = {
      name: name.trim(),
      description: description ? description.trim() : undefined
    };

    const department = await Department.create(departmentData);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department: {
        id: department._id,
        departmentId: department.departmentId,
        name: department.name,
        description: department.description,
        isActive: department.isActive,
        createdAt: department.createdAt
      }
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create department',
      error: error.message
    });
  }
};

// Get all departments with statistics (super_admin only)
export const getDepartments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Search by name or department ID
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { departmentId: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.isActive = status === 'active';
    }

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [departments, total] = await Promise.all([
      Department.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Department.countDocuments(query)
    ]);

    // Get statistics for each department
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const officerCount = await User.countDocuments({
          role: 'officer',
          department: dept.name,
          isActive: true
        });

        const departmentHeadCount = await User.countDocuments({
          role: 'department_head',
          department: dept.name,
          isActive: true
        });

        const complaintCount = await Complaint.countDocuments({
          department: dept.name
        });

        const pendingComplaintCount = await Complaint.countDocuments({
          department: dept.name,
          status: 'pending'
        });

        return {
          ...dept.toObject(),
          officerCount,
          departmentHeadCount,
          complaintCount,
          pendingComplaintCount
        };
      })
    );

    res.status(200).json({
      success: true,
      departments: departmentsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
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

// Get department by ID (super_admin only)
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Get statistics
    const officerCount = await User.countDocuments({
      role: 'officer',
      department: department.name,
      isActive: true
    });

    const departmentHeadCount = await User.countDocuments({
      role: 'department_head',
      department: department.name,
      isActive: true
    });

    const complaintCount = await Complaint.countDocuments({
      department: department.name
    });

    const pendingComplaintCount = await Complaint.countDocuments({
      department: department.name,
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      department: {
        ...department.toObject(),
        officerCount,
        departmentHeadCount,
        complaintCount,
        pendingComplaintCount
      }
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department',
      error: error.message
    });
  }
};

// Update department (super_admin only)
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Validate name if being changed
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({ name: name.trim() });
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Department name already exists'
        });
      }

      // Check if department has officers or complaints
      const officerCount = await User.countDocuments({
        role: 'officer',
        department: department.name
      });

      const complaintCount = await Complaint.countDocuments({
        department: department.name
      });

      if (officerCount > 0 || complaintCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot rename department with associated officers or complaints'
        });
      }

      department.name = name.trim();
    }

    if (description !== undefined) {
      department.description = description ? description.trim() : undefined;
    }

    if (isActive !== undefined) {
      // Check if department has active officers or complaints before deactivating
      if (!isActive) {
        const officerCount = await User.countDocuments({
          role: 'officer',
          department: department.name,
          isActive: true
        });

        const complaintCount = await Complaint.countDocuments({
          department: department.name,
          status: { $in: ['pending', 'assigned', 'in_progress'] }
        });

        if (officerCount > 0 || complaintCount > 0) {
          return res.status(400).json({
            success: false,
            message: 'Cannot deactivate department with active officers or pending complaints'
          });
        }
      }

      department.isActive = isActive;
    }

    await department.save();

    // Get updated statistics
    const officerCount = await User.countDocuments({
      role: 'officer',
      department: department.name,
      isActive: true
    });

    const departmentHeadCount = await User.countDocuments({
      role: 'department_head',
      department: department.name,
      isActive: true
    });

    const complaintCount = await Complaint.countDocuments({
      department: department.name
    });

    const pendingComplaintCount = await Complaint.countDocuments({
      department: department.name,
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      department: {
        ...department.toObject(),
        officerCount,
        departmentHeadCount,
        complaintCount,
        pendingComplaintCount
      }
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update department',
      error: error.message
    });
  }
};

// Get department officers (super_admin only)
export const getDepartmentOfficers = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      status = ''
    } = req.query;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Build query
    const query = {
      role: 'officer',
      department: department.name
    };

    if (status) {
      query.isActive = status === 'active';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [officers, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      department: {
        id: department._id,
        departmentId: department.departmentId,
        name: department.name
      },
      officers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get department officers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department officers',
      error: error.message
    });
  }
};

// Get department complaints (super_admin only)
export const getDepartmentComplaints = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      status = '',
      priority = ''
    } = req.query;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Build query
    const query = { department: department.name };

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
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Complaint.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      department: {
        id: department._id,
        departmentId: department.departmentId,
        name: department.name
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
    console.error('Get department complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department complaints',
      error: error.message
    });
  }
};
