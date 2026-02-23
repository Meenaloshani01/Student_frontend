import { useCountUp } from '../hooks/useCountUp';
import './SummaryCards.css';

export default function SummaryCards({ total = 0, high = 0, medium = 0, low = 0, animated = true }) {
  const animTotal = useCountUp(total, 900, animated);
  const animHigh = useCountUp(high, 800, animated);
  const animMedium = useCountUp(medium, 800, animated);
  const animLow = useCountUp(low, 800, animated);

  const cards = [
    { label: 'Total Students', value: animTotal, variant: 'total' },
    { label: 'High Risk', value: animHigh, variant: 'high' },
    { label: 'Medium Risk', value: animMedium, variant: 'medium' },
    { label: 'Low Risk', value: animLow, variant: 'low' },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card, i) => (
        <div
          key={card.variant}
          className={`summary-card summary-card--${card.variant}`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <span className="summary-card-label">{card.label}</span>
          <span className="summary-card-value">{card.value}</span>
        </div>
      ))}
    </div>
  );
}
