import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Table } from '@/components/common/Table';
import { useToast } from '@/context/ToastContext';
import { complaintService } from '@/services/complaintService';
import { LayoutDashboard, Users, FileText, Building2, AlertTriangle } from 'lucide-react';

export function AdminDashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalComplaints: 0,
    departments: 0,
    critical: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get complaint statistics
      const complaintStats = await complaintService.getComplaintStats();
      
      setStats({
        totalUsers: 1, // Mock value for now
        totalComplaints: complaintStats.stats.total || 0,
        departments: complaintStats.departmentStats?.length || 0,
        critical: complaintStats.stats.critical || 0
      });

      // Get recent complaints
      const allComplaints = await complaintService.getAllComplaints();
      setRecentComplaints((allComplaints.complaints || []).slice(0, 5));
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCategory = (category) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Super Admin Dashboard"
          description="System-wide overview of users, complaints, and departments"
          icon={LayoutDashboard}
        />
        <div className="card-base p-8">
          <div className="text-center text-civic-text-secondary">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  const columns = [
    { key: 'complaintId', label: 'ID', width: 'w-32' },
    { key: 'title', label: 'Title', width: 'flex-1' },
    { key: 'category', label: 'Category', width: 'w-32' },
    { key: 'department', label: 'Department', width: 'w-40' },
    { key: 'status', label: 'Status', width: 'w-32' },
    { key: 'createdAt', label: 'Created', width: 'w-36' },
  ];

  return (
    <div>
      <PageHeader
        title="Super Admin Dashboard"
        description="System-wide overview of users, complaints, and departments"
        icon={LayoutDashboard}
      />
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
        <StatCard label="Total Complaints" value={stats.totalComplaints} icon={FileText} color="teal" />
        <StatCard label="Departments" value={stats.departments} icon={Building2} color="purple" />
        <StatCard label="Critical Issues" value={stats.critical} icon={AlertTriangle} color="red" />
      </div>

      <div className="card-base">
        <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Recent Complaints</h3>
        {recentComplaints.length === 0 ? (
          <div className="text-center py-8 text-civic-text-secondary">
            No complaints yet
          </div>
        ) : (
          <Table
            columns={columns}
            data={recentComplaints.map(complaint => ({
              complaintId: complaint.complaintId,
              title: complaint.title,
              category: formatCategory(complaint.category),
              department: complaint.department,
              status: complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1).replace('_', ' '),
              createdAt: formatDate(complaint.createdAt)
            }))}
          />
        )}
      </div>
    </div>
  );
}
