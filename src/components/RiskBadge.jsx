import './RiskBadge.css';

const RISK_TITLES = {
  HIGH: 'High risk – needs intervention',
  MEDIUM: 'Medium risk – monitor progress',
  LOW: 'Low risk – on track',
};

export default function RiskBadge({ level }) {
  if (!level) return null;
  const normalized = String(level).toUpperCase();
  const title = RISK_TITLES[normalized] || `${normalized} risk`;
  return (
    <span className={`risk-badge risk-badge--${normalized}`} title={title}>
      {normalized}
    </span>
  );
}
