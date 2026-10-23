import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

// Create a new complaint
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, location, phoneNumber, images, submittedBy } = req.body;
    const userId = req.user?.id || submittedBy; // Will come from auth middleware later

    // Validate required fields
    if (!title || !description || !category || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, and phone number'
      });
    }

    // If no user ID provided, get the first user from database
    let finalSubmittedBy = userId;
    if (!finalSubmittedBy) {
      const firstUser = await User.findOne({ role: 'citizen' });
      if (firstUser) {
        finalSubmittedBy = firstUser._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'No user found to submit complaint'
        });
      }
    }

    // Determine department based on category
    const departmentMap = {
      'roads': 'Public Works',
      'water': 'Water Department',
      'electricity': 'Electricity Department',
      'sanitation': 'Sanitation Department',
      'public_safety': 'Police Department',
      'other': 'General Administration'
    };

    const department = departmentMap[category] || 'General Administration';

    const complaintData = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority: priority || 'medium',
      status: 'pending',
      location: location || {},
      phoneNumber: phoneNumber.trim(),
      images: Array.isArray(images) ? images.filter(img => img && typeof img === 'string') : [],
      submittedBy: finalSubmittedBy,
      department,
      aiClassification: {
        category,
        priority: priority || 'medium',
        confidence: 0.85
      }
    };

    const complaint = await Complaint.create(complaintData);

    // Add initial status to history
    complaint.statusHistory.push({
      status: 'pending',
      changedBy: finalSubmittedBy,
      note: 'Complaint submitted'
    });
    await complaint.save();

    // Create notification for the user
    try {
      await Notification.create({
        recipient: finalSubmittedBy,
        title: 'Complaint Submitted',
        message: `Your complaint ${complaint.complaintId} has been submitted successfully.`,
        type: 'complaint_submitted',
        relatedComplaint: complaint._id
      });
    } catch (notificationError) {
      // Don't fail the complaint creation if notification creation fails
    }

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      complaint: {
        id: complaint._id,
        complaintId: complaint.complaintId,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        priority: complaint.priority,
        status: complaint.status,
        location: complaint.location,
        phoneNumber: complaint.phoneNumber,
        images: complaint.images,
        department: complaint.department,
        createdAt: complaint.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create complaint',
      error: error.message
    });
  }
};

// Get all complaints (with filtering)
export const getAllComplaints = async (req, res) => {
  try {
    const { status, category, priority, department } = req.query;
    const filter = {};

    // Security: Department heads can only view complaints from their department
    if (req.user.role === 'department_head') {
      filter.department = req.user.department || department;
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (department && req.user.role !== 'department_head') filter.department = department;

    const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
};

// Get complaint by ID
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID'
      });
    }

    const complaint = await Complaint.findById(id)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('remarks.user', 'name email')
      .populate('statusHistory.changedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Security: Citizens can only view their own complaints
    if (req.user.role === 'citizen' && complaint.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own complaints'
      });
    }

    // Security: Officers can only view complaints assigned to them
    if (req.user.role === 'officer' && complaint.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view complaints assigned to you'
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint',
      error: error.message
    });
  }
};

// Get complaint by complaint ID (for tracking)
export const getComplaintByComplaintId = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findOne({ complaintId })
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('remarks.user', 'name email')
      .populate('statusHistory.changedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('Get complaint by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint',
      error: error.message
    });
  }
};

// Valid status transitions
const VALID_TRANSITIONS = {
  pending: ['assigned', 'rejected'],
  assigned: ['in_progress', 'rejected'],
  in_progress: ['resolved', 'rejected'],
  resolved: [], // No transitions from resolved
  rejected: [] // No transitions from rejected
};

// Update complaint status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, resolutionText, resolutionImages } = req.body;
    const userId = req.user?.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID'
      });
    }

    // Validate inputs
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Validate status value
    const validStatuses = ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Security: Officers can only update complaints assigned to them
    if (req.user.role === 'officer' && complaint.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update complaints assigned to you'
      });
    }

    // Validate status transition
    const currentStatus = complaint.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
    
    if (currentStatus === status) {
      return res.status(400).json({
        success: false,
        message: `Complaint is already ${status}`
      });
    }

    if (allowedTransitions.length > 0 && !allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${currentStatus} to ${status}. Allowed transitions: ${allowedTransitions.join(', ')}`
      });
    }

    // Store previous status for history
    const previousStatus = complaint.status;
    
    // Update status
    complaint.status = status;
    complaint.statusHistory.push({
      status,
      changedBy: userId,
      note: note || `Status changed from ${previousStatus} to ${status}`
    });

    if (status === 'resolved') {
      complaint.resolutionEvidence.resolvedAt = new Date();
      if (resolutionText) {
        complaint.resolutionEvidence.text = resolutionText;
      }
      if (resolutionImages && Array.isArray(resolutionImages)) {
        complaint.resolutionEvidence.images = resolutionImages;
      }
    }

    await complaint.save();

    // Create notification for the complaint submitter
    try {
      const notificationMessages = {
        assigned: 'Your complaint has been assigned to an officer.',
        in_progress: 'Your complaint is now being worked on.',
        resolved: 'Your complaint has been resolved.',
        rejected: 'Your complaint has been rejected.'
      };

      if (notificationMessages[status] && complaint.submittedBy) {
        await Notification.create({
          recipient: complaint.submittedBy,
          title: `Complaint ${status.replace('_', ' ')}`,
          message: notificationMessages[status],
          type: `complaint_${status}`,
          relatedComplaint: complaint._id
        });
      }
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the status update if notification creation fails
    }

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint: {
        id: complaint._id,
        complaintId: complaint.complaintId,
        status: complaint.status,
        previousStatus,
        updatedAt: complaint.updatedAt,
        resolutionEvidence: complaint.resolutionEvidence
      }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
      error: error.message
    });
  }
};

// Update complaint priority
export const updateComplaintPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority, note } = req.body;
    const userId = req.user?.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID'
      });
    }

    // Validate inputs
    if (!priority) {
      return res.status(400).json({
        success: false,
        message: 'Priority is required'
      });
    }

    // Validate priority value
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority value'
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Security: Department heads can only update priority for complaints in their department
    if (req.user.role === 'department_head' && complaint.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update priority for complaints in your department'
      });
    }

    // Store previous priority
    const previousPriority = complaint.priority;
    
    // Update priority
    complaint.priority = priority;
    
    // Add to status history for tracking
    complaint.statusHistory.push({
      status: complaint.status, // Current status unchanged
      changedBy: userId,
      note: note || `Priority changed from ${previousPriority} to ${priority}`
    });

    await complaint.save();

    // Create notification for the assigned officer if complaint is assigned
    try {
      if (complaint.assignedTo) {
        await Notification.create({
          recipient: complaint.assignedTo,
          title: 'Complaint Priority Changed',
          message: `Priority of complaint ${complaint.complaintId} has been changed from ${previousPriority} to ${priority}.`,
          type: 'complaint_priority_changed',
          relatedComplaint: complaint._id
        });
      }
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the priority update if notification creation fails
    }

    res.status(200).json({
      success: true,
      message: 'Complaint priority updated successfully',
      complaint: {
        id: complaint._id,
        complaintId: complaint.complaintId,
        priority: complaint.priority,
        previousPriority,
        updatedAt: complaint.updatedAt
      }
    });
  } catch (error) {
    console.error('Update priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint priority',
      error: error.message
    });
  }
};

// Assign complaint to officer
export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerId } = req.body;

    // Validate MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(officerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid officer ID'
      });
    }

    // Validate inputs
    if (!officerId) {
      return res.status(400).json({
        success: false,
        message: 'Officer ID is required'
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Security: Department heads can only assign complaints in their department
    if (req.user.role === 'department_head' && complaint.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only assign complaints in your department'
      });
    }

    const officer = await User.findById(officerId);
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found'
      });
    }

    // Validate officer role
    if (officer.role !== 'officer') {
      return res.status(400).json({
        success: false,
        message: 'User is not an officer'
      });
    }

    // Validate officer is active
    if (!officer.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Officer is not active'
      });
    }

    // Validate department matching
    if (officer.department && complaint.department) {
      if (officer.department !== complaint.department) {
        return res.status(400).json({
          success: false,
          message: `Officer belongs to ${officer.department} but complaint is for ${complaint.department}`
        });
      }
    }

    // Check if already assigned
    if (complaint.assignedTo) {
      const existingOfficer = await User.findById(complaint.assignedTo);

      // If reassigning to a different officer
      if (complaint.assignedTo.toString() !== officerId) {
        // Reassign the complaint
        const previousOfficerId = complaint.assignedTo;
        complaint.assignedTo = officerId;
        complaint.status = 'assigned';
        complaint.statusHistory.push({
          status: 'assigned',
          changedBy: req.user?.id || officerId,
          note: `Reassigned from ${existingOfficer?.name || 'previous officer'} to ${officer.name} (${officer.department})`
        });

        await complaint.save();

        // Create notification for the new officer
        try {
          await Notification.create({
            recipient: officerId,
            title: 'Complaint Reassigned',
            message: `Complaint ${complaint.complaintId} has been reassigned to you. ${complaint.title}`,
            type: 'complaint_reassigned',
            relatedComplaint: complaint._id
          });
        } catch (notificationError) {
          console.error('Failed to create notification for new officer:', notificationError);
        }

        // Create notification for the previous officer
        try {
          await Notification.create({
            recipient: previousOfficerId,
            title: 'Complaint Reassigned',
            message: `Complaint ${complaint.complaintId} has been reassigned from you to ${officer.name}.`,
            type: 'complaint_reassigned',
            relatedComplaint: complaint._id
          });
        } catch (notificationError) {
          console.error('Failed to create notification for previous officer:', notificationError);
        }

        return res.status(200).json({
          success: true,
          message: 'Complaint reassigned successfully',
          complaint: {
            id: complaint._id,
            complaintId: complaint.complaintId,
            title: complaint.title,
            status: complaint.status,
            assignedTo: {
              id: officer._id,
              name: officer.name,
              email: officer.email,
              department: officer.department
            }
          }
        });
      }

      return res.status(400).json({
        success: false,
        message: `Complaint is already assigned to ${existingOfficer?.name || 'an officer'}`
      });
    }

    // Assign the complaint
    complaint.assignedTo = officerId;
    complaint.status = 'assigned';
    complaint.statusHistory.push({
      status: 'assigned',
      changedBy: req.user?.id || officerId,
      note: `Assigned to officer ${officer.name} (${officer.department})`
    });

    await complaint.save();

    // Create notification for the officer
    try {
      const Notification = (await import('../models/Notification.js')).default;
      await Notification.create({
        recipient: officerId,
        title: 'New Complaint Assigned',
        message: `Complaint ${complaint.complaintId} has been assigned to you. ${complaint.title}`,
        type: 'complaint_assigned',
        relatedComplaint: complaint._id
      });
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the assignment if notification creation fails
    }

    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      complaint: {
        id: complaint._id,
        complaintId: complaint.complaintId,
        title: complaint.title,
        status: complaint.status,
        assignedTo: {
          id: officer._id,
          name: officer.name,
          email: officer.email,
          department: officer.department
        }
      }
    });
  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign complaint',
      error: error.message
    });
  }
};

// Add remark to complaint
export const addRemark = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user?.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID'
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Security: Citizens can only add remarks to their own complaints
    if (req.user.role === 'citizen' && complaint.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only add remarks to your own complaints'
      });
    }

    // Security: Officers can only add remarks to complaints assigned to them
    if (req.user.role === 'officer' && complaint.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only add remarks to complaints assigned to you'
      });
    }

    complaint.remarks.push({
      user: userId,
      text,
      timestamp: new Date()
    });

    await complaint.save();

    // Create notification for the assigned officer if remark is added by admin
    try {
      const user = await User.findById(userId);
      if (user?.role === 'super_admin' && complaint.assignedTo) {
        await Notification.create({
          recipient: complaint.assignedTo,
          title: 'Complaint Update',
          message: `Administrator has added an update to complaint ${complaint.complaintId}.`,
          type: 'complaint_update',
          relatedComplaint: complaint._id
        });
      }
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the remark addition if notification creation fails
    }

    res.status(200).json({
      success: true,
      message: 'Remark added successfully',
      complaint
    });
  } catch (error) {
    console.error('Add remark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add remark',
      error: error.message
    });
  }
};

// Get complaints for a specific user
export const getUserComplaints = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, category, priority, department } = req.query;

    // Security: Users can only view their own complaints unless they are super_admin
    if (req.user.role !== 'super_admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own complaints'
      });
    }

    const filter = { submittedBy: userId };

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (department) filter.department = department;

    const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
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

// Get complaint statistics
export const getComplaintStats = async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } }
        }
      }
    ]);

    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const departmentStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        total: 0,
        pending: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0,
        critical: 0
      },
      categoryStats,
      departmentStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get complaints assigned to the authenticated officer
export const getMyAssignedComplaints = async (req, res) => {
  try {
    const officerId = req.user.id; // Get officer ID from JWT token
    const { status, category, priority } = req.query;

    // Build filter for assigned complaints
    const filter = { assignedTo: officerId };

    // Add optional filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('Get my assigned complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned complaints',
      error: error.message
    });
  }
};

// Get officer dashboard statistics
export const getOfficerDashboardStats = async (req, res) => {
  try {
    const officerId = req.user.id; // Get officer ID from JWT token

    // Convert to ObjectId for proper MongoDB comparison
    const officerObjectId = new mongoose.Types.ObjectId(officerId);

    // Calculate statistics using aggregation
    const stats = await Complaint.aggregate([
      {
        $match: { assignedTo: officerObjectId }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $in: ['$priority', ['high', 'critical']] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      highPriority: 0
    };

    // Get recent assigned complaints (last 5)
    const recentComplaints = await Complaint.find({ assignedTo: officerId })
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get high-priority complaints
    const highPriorityComplaints = await Complaint.find({
      assignedTo: officerId,
      priority: { $in: ['high', 'critical'] }
    })
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      stats: {
        total: result.total,
        assigned: result.assigned,
        inProgress: result.inProgress,
        resolved: result.resolved,
        highPriority: result.highPriority
      },
      recentComplaints,
      highPriorityComplaints
    });
  } catch (error) {
    console.error('Get officer dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};