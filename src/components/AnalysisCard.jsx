import RiskBadge from './RiskBadge';
import './AnalysisCard.css';

export default function AnalysisCard({ data }) {
  if (!data) return null;

  // Handle different response formats
  let summary, risk_factors, recommendations;
  
  if (typeof data === 'string') {
    try {
      // Try to parse if it's a JSON string
      const parsed = JSON.parse(data);
      summary = parsed.summary || parsed.ai_analysis?.summary;
      risk_factors = parsed.risk_factors || parsed.ai_analysis?.risk_factors || [];
      recommendations = parsed.recommendations || parsed.ai_analysis?.recommendations || [];
    } catch {
      // If not JSON, treat as plain text
      summary = data;
      risk_factors = [];
      recommendations = [];
    }
  } else if (data.ai_analysis) {
    // Handle nested ai_analysis structure
    summary = data.ai_analysis.summary;
    risk_factors = data.ai_analysis.risk_factors || [];
    recommendations = data.ai_analysis.recommendations || [];
  } else if (data.message) {
    // If data has a message field, use it
    summary = data.message;
    risk_factors = data.risk_factors || [];
    recommendations = data.recommendations || [];
  } else {
    // Standard format
    summary = data.summary;
    risk_factors = data.risk_factors || [];
    recommendations = data.recommendations || [];
  }

  // Ensure arrays
  if (!Array.isArray(risk_factors)) risk_factors = [];
  if (!Array.isArray(recommendations)) recommendations = [];

  // If still no content, don't render
  if (!summary && risk_factors.length === 0 && recommendations.length === 0) {
    return (
      <div className="analysis-card">
        <div className="analysis-summary">
          <p className="analysis-summary-text" style={{ color: 'var(--text-secondary)' }}>
            No analysis data available
          </p>
        </div>
      </div>
    );
  }

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
