import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Create a new complaint
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, location, images, submittedBy } = req.body;
    const userId = req.user?.id || submittedBy; // Will come from auth middleware later

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category'
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
      images: images || [],
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
      console.error('Failed to create notification:', notificationError);
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

// Update complaint status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const userId = req.user?.id || '67a000000000000000000001'; // Mock user ID

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      changedBy: userId,
      note: note || `Status changed to ${status}`
    });

    if (status === 'resolved') {
      complaint.resolutionEvidence.resolvedAt = new Date();
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
      complaint
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

// Assign complaint to officer
export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerId } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const officer = await User.findById(officerId);
    if (!officer || officer.role !== 'officer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid officer'
      });
    }

    complaint.assignedTo = officerId;
    complaint.status = 'assigned';
    complaint.statusHistory.push({
      status: 'assigned',
      changedBy: req.user?.id || '67a000000000000000000001',
      note: `Assigned to officer ${officer.name}`
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      complaint
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
    const userId = req.user?.id || '67a000000000000000000001'; // Mock user ID

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.remarks.push({
      user: userId,
      text,
      timestamp: new Date()
    });

    await complaint.save();

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