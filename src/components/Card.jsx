function Card({ title, value, subtitle, color = 'primary' }) {
  const colorClasses = {
    primary: 'text-text-primary',
    blue: 'text-tech-blue',
    green: 'text-trade-up',
    red: 'text-trade-down',
    cyan: 'text-tech-cyan'
  };

  return (
    <div className="bg-dark-card border border-dark-border p-4 rounded-lg hover:border-tech-blue/40 transition-all shadow-card">
      <h4 className="text-xs text-text-secondary uppercase tracking-wider mb-2">{title}</h4>
      <p className={`text-2xl font-bold font-mono tabular-nums ${colorClasses[color] || colorClasses.primary}`}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
    </div>
  );
}

export default Card;
