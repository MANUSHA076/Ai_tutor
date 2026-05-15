export function MetricCard({ icon, label, value }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </div>
  )
}
