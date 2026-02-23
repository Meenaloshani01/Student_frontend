import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  useEffect(() => {
    document.title = 'Student Advisor AI – Result Analysis & Pass Prediction';
    return () => { document.title = 'Student Advisor AI'; };
  }, []);

  return (
    <div className="landing">
      <div className="landing-hero">
        <h1 className="landing-title">Student Advisor AI</h1>
        <p className="landing-tagline">
          Result analysis and pass prediction at a glance. Identify at-risk students, get insights, and generate targeted quizzes.
        </p>
        <Link to="/dashboard" className="landing-cta">
          Go to Dashboard
        </Link>
      </div>

      <div className="landing-features">
        <div className="landing-feature">
          <span className="landing-feature-icon">📊</span>
          <h3 className="landing-feature-title">Dashboard</h3>
          <p className="landing-feature-desc">View risk distribution, pass probability, and filter students by risk level or weak topics.</p>
          <Link to="/dashboard" className="landing-feature-link">Open Dashboard →</Link>
        </div>
        <div className="landing-feature">
          <span className="landing-feature-icon">💬</span>
          <h3 className="landing-feature-title">AI Advisor</h3>
          <p className="landing-feature-desc">Ask for interventions, student risk analysis, or generate quizzes for high-risk students.</p>
          <Link to="/advisor" className="landing-feature-link">Open AI Advisor →</Link>
        </div>
      </div>

      <footer className="landing-footer">
        <p>Connect your FastAPI backend and start analyzing.</p>
      </footer>
    </div>
  );
}
