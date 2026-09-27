import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LayoutDashboard, FileText, Zap, CheckCircle2 } from 'lucide-react';

export function OfficerDashboard() {
  return (
    <div>
      <PageHeader
        title="Officer Dashboard"
        description="Complaints assigned to you and their current status"
        icon={LayoutDashboard}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Assigned" value="—" icon={FileText} color="blue" />
        <StatCard label="In Progress" value="—" icon={Zap} color="purple" />
        <StatCard label="Resolved" value="—" icon={CheckCircle2} color="green" />
        <StatCard label="Total" value="—" icon={LayoutDashboard} color="teal" />
      </div>
      <div className="card-base">
        <EmptyState
          icon={FileText}
          title="No assigned complaints"
          description="Assigned complaints will appear here once the backend is connected in Phase 5."
        />
      </div>
    </div>
  );
}
