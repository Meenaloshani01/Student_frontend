import './RiskBadge.css';

export default function RiskBadge({ level }) {
  if (!level) return null;
  const normalized = String(level).toUpperCase();
  return (
    <span className={`risk-badge risk-badge--${normalized}`}>
      {normalized}
    </span>
  );
}
