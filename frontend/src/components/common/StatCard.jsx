import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export function StatCard({ label, value, icon: Icon, color = 'blue', trend = null, subtitle = null }) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-civic-blue', iconBg: 'bg-blue-100' },
    teal: { bg: 'bg-teal-50', text: 'text-civic-teal', iconBg: 'bg-teal-100' },
    purple: { bg: 'bg-purple-50', text: 'text-status-progress', iconBg: 'bg-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-status-pending', iconBg: 'bg-orange-100' },
    green: { bg: 'bg-green-50', text: 'text-status-resolved', iconBg: 'bg-green-100' },
    red: { bg: 'bg-red-50', text: 'text-status-rejected', iconBg: 'bg-red-100' },
    slate: { bg: 'bg-slate-50', text: 'text-civic-text-secondary', iconBg: 'bg-slate-100' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="card-base p-5 hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-civic-text-secondary">{label}</p>
          <motion.p
            className="mt-1.5 text-2xl font-bold text-civic-text-primary tabular-nums"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-civic-muted">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {trend.direction === 'up' ? (
                <TrendingUp size={14} className="text-status-resolved" />
              ) : (
                <TrendingDown size={14} className="text-status-rejected" />
              )}
              <span className={trend.direction === 'up' ? 'text-status-resolved' : 'text-status-rejected'}>
                {trend.value}
              </span>
              <span className="text-civic-muted">{trend.label}</span>
            </div>
          )}
        </div>
        {Icon && (
          <motion.div
            className={`flex-shrink-0 p-3 rounded-lg ${c.iconBg}`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon size={22} className={c.text} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
