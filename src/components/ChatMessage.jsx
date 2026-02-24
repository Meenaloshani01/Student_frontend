import RiskBadge from './RiskBadge';
import QuizDisplay from './QuizDisplay';
import AnalysisCard from './AnalysisCard';
import './ChatMessage.css';

function getCopyText(message, data) {
  let text = message || '';
  if (data != null && typeof data === 'object') {
    text += '\n\n' + (Array.isArray(data) ? JSON.stringify(data, null, 2) : JSON.stringify(data, null, 2));
  }
  return text;
}

export default function ChatMessage({ type, message, data, isUser, onCopy }) {
  if (isUser) {
    return (
      <div className="chat-msg chat-msg--user">
        <p className="chat-msg-text">{message}</p>
      </div>
    );
  }

  const copyText = getCopyText(message, data);

  // Format message text - convert markdown-style formatting to HTML
  const formatMessage = (text) => {
    if (!text) return '';
    
    // Split by lines and format
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      // Filter out unwanted lines
      .filter(line => {
        const lower = line.toLowerCase();
        return !lower.includes('identified weaknesses') && 
               !lower.includes('identified at-risk') &&
               !lower.includes('pass probability:**') &&
               !/pass probability.*\(id \d+\)/i.test(line);
      })
      .map((line, idx) => {
        // Headers (lines with **)
        if (line.startsWith('**') && line.endsWith('**')) {
          return <h4 key={idx} className="chat-msg-heading">{line.replace(/\*\*/g, '')}</h4>;
        }
        // Bullet points
        if (line.startsWith('*') || line.startsWith('-')) {
          return <li key={idx} className="chat-msg-list-item">{line.substring(1).trim()}</li>;
        }
        // Numbered lists
        if (/^\d+\./.test(line)) {
          return <li key={idx} className="chat-msg-list-item chat-msg-list-numbered">{line.replace(/^\d+\.\s*/, '')}</li>;
        }
        // Regular paragraph
        return <p key={idx} className="chat-msg-paragraph">{line}</p>;
      });
    
    return lines;
  };

  const handleDownloadPDF = () => {
    // Create a simple text version for PDF
    const pdfContent = `
Student Advisor AI - Revision Plan
Generated: ${new Date().toLocaleDateString()}

${message}
    `.trim();
    
    // Create a blob and download
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revision-plan-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="chat-msg chat-msg--bot">
      <div className="chat-msg-header">
        <div className="chat-msg-content">
          {formatMessage(message)}
        </div>
        <div className="chat-msg-actions">
          {message && message.toLowerCase().includes('revision') && (
            <button
              type="button"
              className="chat-msg-download"
              onClick={handleDownloadPDF}
              aria-label="Download as PDF"
              title="Download revision plan"
            >
              📥 PDF
            </button>
          )}
          {onCopy && copyText && (
            <button
              type="button"
              className="chat-msg-copy"
              onClick={() => onCopy(copyText)}
              aria-label="Copy response"
            >
              Copy
            </button>
          )}
        </div>
      </div>

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
    </div>
  );
}
