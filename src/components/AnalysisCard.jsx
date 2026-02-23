import RiskBadge from './RiskBadge';
import './AnalysisCard.css';

export default function AnalysisCard({ data }) {
  if (!data) return null;

  const {
    summary,
    risk_factors = [],
    recommendations = [],
  } = data;

  return (
    <div className="analysis-card">
      {summary && (
        <div className="analysis-summary">
          <h4 className="analysis-heading">Summary</h4>
          <p className="analysis-summary-text">{summary}</p>
        </div>
      )}

      {risk_factors.length > 0 && (
        <div className="analysis-factors">
          <h4 className="analysis-heading">Risk Factors</h4>
          <div className="analysis-table-wrap">
            <table className="analysis-table">
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {risk_factors.map((factor, i) => (
                  <tr key={i}>
                    <td>
                      {typeof factor === 'string'
                        ? factor
                        : factor.factor || factor.description || JSON.stringify(factor)}
                    </td>
                    <td>
                      <RiskBadge
                        level={
                          typeof factor === 'object' && factor.severity
                            ? factor.severity
                            : 'MEDIUM'
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="analysis-recommendations">
          <h4 className="analysis-heading">Recommendations</h4>
          <ol className="analysis-list">
            {recommendations.map((rec, i) => (
              <li key={i} className="analysis-list-item">
                {typeof rec === 'string' ? rec : rec.action || rec.text || JSON.stringify(rec)}
                {typeof rec === 'object' && rec.priority && (
                  <span className="analysis-priority">Priority: {rec.priority}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
