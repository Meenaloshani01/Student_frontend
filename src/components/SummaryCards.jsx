import './SummaryCards.css';

export default function SummaryCards({ total = 0, high = 0, medium = 0, low = 0 }) {
  const cards = [
    { label: 'Total Students', value: total, variant: 'total' },
    { label: 'High Risk', value: high, variant: 'high' },
    { label: 'Medium Risk', value: medium, variant: 'medium' },
    { label: 'Low Risk', value: low, variant: 'low' },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card) => (
        <div key={card.variant} className={`summary-card summary-card--${card.variant}`}>
          <span className="summary-card-label">{card.label}</span>
          <span className="summary-card-value">{card.value}</span>
        </div>
      ))}
    </div>
  );
}
