import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

/**
 * Analytics Controller
 * Provides comprehensive complaint analytics with date filtering
 * All endpoints are restricted to super_admin role
 */

// Helper function to validate and parse date range
const parseDateRange = (startDate, endDate) => {
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date();

  // Set start to beginning of day
  start.setHours(0, 0, 0, 0);
  // Set end to end of day
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// Helper function to get date range based on preset
const getPresetDateRange = (preset) => {
  const now = new Date();
  const start = new Date();

  switch (preset) {
    case '7':
      start.setDate(now.getDate() - 7);
      break;
    case '30':
      start.setDate(now.getDate() - 30);
      break;
    case '90':
      start.setDate(now.getDate() - 90);
      break;
    default:
      start.setDate(now.getDate() - 7);
  }

  start.setHours(0, 0, 0, 0);
  now.setHours(23, 59, 59, 999);

  return { start, end: now };
};

/**
 * Get comprehensive analytics with date filtering
 * @route GET /api/analytics/overview
 */
export const getAnalyticsOverview = async (req, res) => {
  try {
    const { range = '7', startDate, endDate } = req.query;

    // Determine date range
    let dateRange;
    if (startDate && endDate) {
      dateRange = parseDateRange(startDate, endDate);
    } else {
      dateRange = getPresetDateRange(range);
    }

    const { start, end } = dateRange;

    // 1. Total complaints received
    const totalComplaints = await Complaint.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    // 2. Total resolved complaints
    const resolvedComplaints = await Complaint.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'resolved'
    });

    // 3. Total pending complaints
    const pendingComplaints = await Complaint.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'pending'
    });

    // 4. Total in-progress complaints
    const inProgressComplaints = await Complaint.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'in_progress'
    });

    // 5. Total rejected complaints
    const rejectedComplaints = await Complaint.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'rejected'
    });

    // 6. Complaint resolution rate
    // Formula: (Resolved Complaints / Total Complaints) * 100
    // Excludes rejected complaints from denominator
    const totalExcludingRejected = totalComplaints - rejectedComplaints;
    const resolutionRate = totalExcludingRejected > 0
      ? ((resolvedComplaints / totalExcludingRejected) * 100).toFixed(2)
      : 0;

    // 7. Average resolution time
    // Only includes resolved complaints with valid timestamps
    const resolvedWithTimestamps = await Complaint.find({
      createdAt: { $gte: start, $lte: end },
      status: 'resolved',
      'resolutionEvidence.resolvedAt': { $exists: true, $ne: null }
    }).select('createdAt resolutionEvidence.resolvedAt');

    let totalResolutionTime = 0;
    let validResolutionCount = 0;

    resolvedWithTimestamps.forEach(complaint => {
      const created = new Date(complaint.createdAt);
      const resolved = new Date(complaint.resolutionEvidence.resolvedAt);
      const diffMs = resolved - created;
      const diffHours = diffMs / (1000 * 60 * 60); // Convert to hours

      if (diffHours >= 0) {
        totalResolutionTime += diffHours;
        validResolutionCount++;
      }
    });

    const avgResolutionTime = validResolutionCount > 0
      ? (totalResolutionTime / validResolutionCount).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        preset: startDate && endDate ? 'custom' : `${range} days`
      },
      metrics: {
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        inProgressComplaints,
        rejectedComplaints,
        resolutionRate: parseFloat(resolutionRate),
        avgResolutionTime: parseFloat(avgResolutionTime),
        avgResolutionTimeUnit: 'hours'
      }
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics overview',
      error: error.message
    });
  }
};

/**
 * Get complaints grouped by category
 * @route GET /api/analytics/by-category
 */
export const getComplaintsByCategory = async (req, res) => {
  try {
    const { range = '7', startDate, endDate } = req.query;

    let dateRange;
    if (startDate && endDate) {
      dateRange = parseDateRange(startDate, endDate);
    } else {
      dateRange = getPresetDateRange(range);
    }

    const { start, end } = dateRange;

    const categoryStats = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const formattedData = categoryStats.map(item => ({
      category: item._id,
      total: item.count,
      resolved: item.resolved,
      pending: item.pending,
      inProgress: item.inProgress
    }));

    res.status(200).json({
      success: true,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      data: formattedData
    });
  } catch (error) {
    console.error('Get complaints by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints by category',
      error: error.message
    });
  }
};

/**
 * Get complaints grouped by status
 * @route GET /api/analytics/by-status
 */
export const getComplaintsByStatus = async (req, res) => {
  try {
    const { range = '7', startDate, endDate } = req.query;

    let dateRange;
    if (startDate && endDate) {
      dateRange = parseDateRange(startDate, endDate);
    } else {
      dateRange = getPresetDateRange(range);
    }

    const { start, end } = dateRange;

    const statusStats = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const formattedData = statusStats.map(item => ({
      status: item._id,
      count: item.count
    }));

    res.status(200).json({
      success: true,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      data: formattedData
    });
  } catch (error) {
    console.error('Get complaints by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints by status',
      error: error.message
    });
  }
};

/**
 * Get complaints grouped by department
 * @route GET /api/analytics/by-department
 */
export const getComplaintsByDepartment = async (req, res) => {
  try {
    const { range = '7', startDate, endDate } = req.query;

    let dateRange;
    if (startDate && endDate) {
      dateRange = parseDateRange(startDate, endDate);
    } else {
      dateRange = getPresetDateRange(range);
    }

    const { start, end } = dateRange;

    const departmentStats = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const formattedData = departmentStats.map(item => ({
      department: item._id || 'Unassigned',
      total: item.count,
      resolved: item.resolved,
      pending: item.pending,
      inProgress: item.inProgress
    }));

    res.status(200).json({
      success: true,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      data: formattedData
    });
  } catch (error) {
    console.error('Get complaints by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints by department',
      error: error.message
    });
  }
};

/**
 * Get complaint submission trends over time
 * @route GET /api/analytics/trends
 */
export const getComplaintTrends = async (req, res) => {
  try {
    const { range = '7', startDate, endDate } = req.query;

    let dateRange;
    if (startDate && endDate) {
      dateRange = parseDateRange(startDate, endDate);
    } else {
      dateRange = getPresetDateRange(range);
    }

    const { start, end } = dateRange;

    // Group by date and status
    const trends = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
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

    // Format data for chart
    const formattedTrends = {};
    trends.forEach(trend => {
      const date = trend._id.date;
      const status = trend._id.status;
      if (!formattedTrends[date]) {
        formattedTrends[date] = { date };
      }
      formattedTrends[date][status] = trend.count;
    });

    // Convert to array and ensure all dates are present
    const trendArray = Object.values(formattedTrends);

    // Get daily totals
    const dailyTotals = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
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
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      trends: trendArray,
      dailyTotals: formattedDailyTotals
    });
  } catch (error) {
    console.error('Get complaint trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint trends',
      error: error.message
    });
  }
};

/**
 * Get officer workload and performance
 * @route GET /api/analytics/officer-performance
 */
export const getOfficerPerformance = async (req, res) => {
  try {
    const { range = '7', startDate, endDate } = req.query;

    let dateRange;
    if (startDate && endDate) {
      dateRange = parseDateRange(startDate, endDate);
    } else {
      dateRange = getPresetDateRange(range);
    }

    const { start, end } = dateRange;

    // Get officers who have been assigned complaints
    const officerStats = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          assignedTo: { $exists: true, $ne: null }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'officer'
        }
      },
      {
        $unwind: '$officer'
      },
      {
        $group: {
          _id: '$assignedTo',
          officerName: { $first: '$officer.name' },
          officerEmail: { $first: '$officer.email' },
          department: { $first: '$officer.department' },
          totalAssigned: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { totalAssigned: -1 }
      }
    ]);

    // Calculate resolution rate for each officer
    const formattedData = officerStats.map(officer => {
      const totalExcludingRejected = officer.totalAssigned;
      const resolutionRate = totalExcludingRejected > 0
        ? ((officer.resolved / totalExcludingRejected) * 100).toFixed(2)
        : 0;

      return {
        officerId: officer._id,
        officerName: officer.officerName,
        officerEmail: officer.officerEmail,
        department: officer.department,
        totalAssigned: officer.totalAssigned,
        resolved: officer.resolved,
        inProgress: officer.inProgress,
        pending: officer.pending,
        resolutionRate: parseFloat(resolutionRate)
      };
    });

    res.status(200).json({
      success: true,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      data: formattedData
    });
  } catch (error) {
    console.error('Get officer performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch officer performance',
      error: error.message
    });
  }
};

/**
 * Get all analytics data in a single call
 * @route GET /api/analytics/all
 */
export const getAllAnalytics = async (req, res) => {
  try {
    const { range = '7', startDate, endDate } = req.query;

    let dateRange;
    if (startDate && endDate) {
      dateRange = parseDateRange(startDate, endDate);
    } else {
      dateRange = getPresetDateRange(range);
    }

    const { start, end } = dateRange;

    // Execute all aggregations in parallel
    const [
      overviewResult,
      categoryResult,
      statusResult,
      departmentResult,
      trendsResult,
      officerResult
    ] = await Promise.all([
      // Overview metrics
      Complaint.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
          }
        }
      ]),

      // By category
      Complaint.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // By status
      Complaint.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // By department
      Complaint.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Trends
      Complaint.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]),

      // Officer performance
      Complaint.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            assignedTo: { $exists: true, $ne: null }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'assignedTo',
            foreignField: '_id',
            as: 'officer'
          }
        },
        {
          $unwind: '$officer'
        },
        {
          $group: {
            _id: '$assignedTo',
            officerName: { $first: '$officer.name' },
            officerEmail: { $first: '$officer.email' },
            department: { $first: '$officer.department' },
            totalAssigned: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
          }
        },
        { $sort: { totalAssigned: -1 } }
      ])
    ]);

    // Calculate resolution rate and avg resolution time
    const overview = overviewResult[0] || {
      total: 0,
      resolved: 0,
      pending: 0,
      inProgress: 0,
      rejected: 0
    };

    const totalExcludingRejected = overview.total - overview.rejected;
    const resolutionRate = totalExcludingRejected > 0
      ? ((overview.resolved / totalExcludingRejected) * 100).toFixed(2)
      : 0;

    // Calculate average resolution time
    const resolvedWithTimestamps = await Complaint.find({
      createdAt: { $gte: start, $lte: end },
      status: 'resolved',
      'resolutionEvidence.resolvedAt': { $exists: true, $ne: null }
    }).select('createdAt resolutionEvidence.resolvedAt');

    let totalResolutionTime = 0;
    let validResolutionCount = 0;

    resolvedWithTimestamps.forEach(complaint => {
      const created = new Date(complaint.createdAt);
      const resolved = new Date(complaint.resolutionEvidence.resolvedAt);
      const diffMs = resolved - created;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours >= 0) {
        totalResolutionTime += diffHours;
        validResolutionCount++;
      }
    });

    const avgResolutionTime = validResolutionCount > 0
      ? (totalResolutionTime / validResolutionCount).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        preset: startDate && endDate ? 'custom' : `${range} days`
      },
      overview: {
        totalComplaints: overview.total,
        resolvedComplaints: overview.resolved,
        pendingComplaints: overview.pending,
        inProgressComplaints: overview.inProgress,
        rejectedComplaints: overview.rejected,
        resolutionRate: parseFloat(resolutionRate),
        avgResolutionTime: parseFloat(avgResolutionTime),
        avgResolutionTimeUnit: 'hours'
      },
      byCategory: categoryResult.map(item => ({
        category: item._id,
        total: item.count,
        resolved: item.resolved
      })),
      byStatus: statusResult.map(item => ({
        status: item._id,
        count: item.count
      })),
      byDepartment: departmentResult.map(item => ({
        department: item._id || 'Unassigned',
        total: item.count,
        resolved: item.resolved
      })),
      trends: trendsResult.map(item => ({
        date: item._id,
        count: item.count
      })),
      officerPerformance: officerResult.map(officer => {
        const rate = officer.totalAssigned > 0
          ? ((officer.resolved / officer.totalAssigned) * 100).toFixed(2)
          : 0;
        return {
          officerId: officer._id,
          officerName: officer.officerName,
          officerEmail: officer.officerEmail,
          department: officer.department,
          totalAssigned: officer.totalAssigned,
          resolved: officer.resolved,
          resolutionRate: parseFloat(rate)
        };
      })
    });
  } catch (error) {
    console.error('Get all analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};
