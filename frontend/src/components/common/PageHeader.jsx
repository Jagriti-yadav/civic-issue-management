export function PageHeader({ title, description, actions = null, icon: Icon = null }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-civic-hover flex items-center justify-center">
            <Icon size={20} className="text-civic-blue" />
          </div>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-civic-text-primary">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-civic-text-secondary max-w-2xl">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
