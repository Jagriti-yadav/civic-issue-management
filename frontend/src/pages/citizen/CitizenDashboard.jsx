import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Table } from '@/components/common/Table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { complaintService } from '@/services/complaintService';
import { LayoutDashboard, FileText, Clock, CheckCircle2, AlertCircle, Plus, Eye } from 'lucide-react';

export function CitizenDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getUserComplaints(user?.id);
      const userComplaints = data.complaints || [];
      setComplaints(userComplaints);
      
      // Calculate stats from user's own complaints
      setStats({
        total: userComplaints.length,
        pending: userComplaints.filter(c => c.status === 'pending').length,
        inProgress: userComplaints.filter(c => c.status === 'in_progress').length,
        resolved: userComplaints.filter(c => c.status === 'resolved').length
      });
    } catch (error) {
      console.error('Failed to load complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'complaintId', label: 'ID', width: 'w-32' },
    { key: 'title', label: 'Title', width: 'flex-1' },
    { key: 'category', label: 'Category', width: 'w-32' },
    { key: 'priority', label: 'Priority', width: 'w-28' },
    { key: 'status', label: 'Status', width: 'w-32' },
    { key: 'createdAt', label: 'Submitted', width: 'w-36' },
    { key: 'actions', label: 'Actions', width: 'w-24' },
  ];

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
          title="Citizen Dashboard"
          description="Overview of your civic complaints and their current status"
          icon={LayoutDashboard}
        />
        <div className="card-base p-8">
          <div className="text-center text-civic-text-secondary">Loading complaints...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Citizen Dashboard"
        description="Overview of your civic complaints and their current status"
        icon={LayoutDashboard}
        action={
          <Link to="/citizen/submit-complaint">
            <Button size="sm" leftIcon={<Plus size={16} />}>
              Submit New Complaint
            </Button>
          </Link>
        }
      />
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Complaints" value={stats.total} icon={FileText} color="blue" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="orange" />
        <StatCard label="In Progress" value={stats.inProgress} icon={AlertCircle} color="purple" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} color="green" />
      </div>

      <div className="card-base">
        {complaints.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No complaints yet"
            description="Start by submitting your first civic issue complaint"
            action={
              <Link to="/citizen/submit-complaint">
                <Button variant="primary" leftIcon={<Plus size={16} />}>
                  Submit New Complaint
                </Button>
              </Link>
            }
          />
        ) : (
          <Table
            columns={columns}
            data={complaints.map(complaint => ({
              complaintId: complaint.complaintId,
              title: complaint.title,
              category: formatCategory(complaint.category),
              priority: <PriorityBadge priority={complaint.priority} />,
              status: <StatusBadge status={complaint.status} />,
              createdAt: formatDate(complaint.createdAt),
              actions: (
                <Link to={`/citizen/complaints/${complaint._id}`}>
                  <Button size="sm" variant="ghost" leftIcon={<Eye size={16} />}>
                    View
                  </Button>
                </Link>
              )
            }))}
          />
        )}
      </div>
    </div>
  );
}
