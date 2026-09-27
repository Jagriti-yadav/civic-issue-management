import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LayoutDashboard, FileText, Clock, Zap, CheckCircle2 } from 'lucide-react';

export function DepartmentHeadDashboard() {
  return (
    <div>
      <PageHeader
        title="Department Head Dashboard"
        description="Overview of complaints in your department"
        icon={LayoutDashboard}
      />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Complaints" value="—" icon={FileText} color="blue" />
        <StatCard label="Pending" value="—" icon={Clock} color="orange" />
        <StatCard label="Assigned" value="—" icon={FileText} color="slate" />
        <StatCard label="In Progress" value="—" icon={Zap} color="purple" />
        <StatCard label="Resolved" value="—" icon={CheckCircle2} color="green" />
      </div>
      <div className="card-base">
        <EmptyState
          icon={FileText}
          title="No complaints yet"
          description="Department complaints will appear here once the backend is connected in Phase 4."
        />
      </div>
    </div>
  );
}
