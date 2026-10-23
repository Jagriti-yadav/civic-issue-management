import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';

// Get dashboard statistics (super_admin only)
export const getDashboardStats = async (req, res) => {
  try {
    // Get user statistics by role
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
        }
      }
    ]);

    const statsMap = {};
    userStats.forEach(stat => {
      statsMap[stat._id] = { total: stat.count, active: stat.active };
    });

    // Get complaint statistics by status
    const complaintStats = await Complaint.aggregate([
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

    // Get complaints by department
    const complaintsByDepartment = await Complaint.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get total departments
    const totalDepartments = await Department.countDocuments();
    const activeDepartments = await Department.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: userStats.reduce((sum, s) => sum + s.count, 0),
          citizens: statsMap.citizen?.total || 0,
          officers: statsMap.officer?.total || 0,
          departmentHeads: statsMap.department_head?.total || 0,
          superAdmins: statsMap.super_admin?.total || 0
        },
        departments: {
          total: totalDepartments,
          active: activeDepartments
        },
        complaints: complaintStats[0] || {
          total: 0,
          pending: 0,
          assigned: 0,
          inProgress: 0,
          resolved: 0,
          rejected: 0,
          critical: 0
        }
      },
      complaintsByDepartment
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get dashboard trends (complaints over time) (super_admin only)
export const getDashboardTrends = async (req, res) => {
  try {
    const { period = '7' } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get complaints grouped by date and status
    const trends = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Format the data for charts
    const formattedTrends = {};
    trends.forEach(trend => {
      const date = trend._id.date;
      const status = trend._id.status;
      if (!formattedTrends[date]) {
        formattedTrends[date] = {};
      }
      formattedTrends[date][status] = trend.count;
    });

    // Get daily totals
    const dailyTotals = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    const formattedDailyTotals = dailyTotals.map(item => ({
      date: item._id,
      count: item.count
    }));

    res.status(200).json({
      success: true,
      trends: formattedTrends,
      dailyTotals: formattedDailyTotals
    });
  } catch (error) {
    console.error('Get dashboard trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard trends',
      error: error.message
    });
  }
};

// Get recent complaints (super_admin only)
export const getRecentComplaints = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const complaints = await Complaint.find()
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    console.error('Get recent complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent complaints',
      error: error.message
    });
  }
};

// Get recent user registrations (super_admin only)
export const getRecentUsers = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get recent users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent users',
      error: error.message
    });
  }
};
