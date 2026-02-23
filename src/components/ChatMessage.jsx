import RiskBadge from './RiskBadge';
import QuizDisplay from './QuizDisplay';
import AnalysisCard from './AnalysisCard';
import './ChatMessage.css';

export default function ChatMessage({ type, message, data, isUser }) {
  if (isUser) {
    return (
      <div className="chat-msg chat-msg--user">
        <p className="chat-msg-text">{message}</p>
      </div>
    );
  }

  return (
    <div className="chat-msg chat-msg--bot">
      <p className="chat-msg-text">{message}</p>

      {type === 'intervention' && data && (() => {
        const list = Array.isArray(data) ? data : (data.students || []);
        if (!list.length) return null;
        return (
        <div className="chat-msg-data">
          <div className="intervention-table-wrap">
            <table className="intervention-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Risk</th>
                  <th>Pass %</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.student_id}>
                    <td>{s.student_id}</td>
                    <td><RiskBadge level={s.risk_level} /></td>
                    <td>{typeof s.pass_probability === 'number' ? `${Math.round(s.pass_probability * 100)}%` : s.pass_probability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        );
      })()}

      {type === 'student_risk' && data && (
        <div className="chat-msg-data">
          <AnalysisCard data={data} />
        </div>
      )}

      {type === 'generate_quiz' && data && (
        <div className="chat-msg-data">
          <QuizDisplay data={data} />
        </div>
      )}

      {type === 'general' && data && typeof data === 'object' && !Array.isArray(data) && (
        <div className="chat-msg-data chat-msg-data--general">
          <pre className="chat-msg-pre">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
