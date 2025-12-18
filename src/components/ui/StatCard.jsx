export default function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  variant = "success",
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {Icon && (
          <div className={`stat-card-icon ${variant}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
    </div>
  );
}
