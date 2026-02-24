import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Student Advisor AI - Home';
    return () => { document.title = 'Student Advisor AI'; };
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <nav className="landing-nav">
        <div className="landing-nav-content">
          <div className="landing-logo">
            <span className="landing-logo-icon">🎓</span>
            <span className="landing-logo-text">Student Advisor AI</span>
          </div>
          <div className="landing-nav-links">
            <button className="landing-nav-link" onClick={() => navigate('/dashboard')}>
              Features
            </button>
            <button className="landing-nav-link" onClick={() => navigate('/reports')}>
              Reports
            </button>
            <button className="landing-nav-link" onClick={() => navigate('/advisor')}>
              AI Advisor
            </button>
          </div>
          <div className="landing-nav-buttons">
            <button className="landing-nav-btn landing-nav-btn-login" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className="landing-nav-btn landing-nav-btn-signup" onClick={() => navigate('/upload')}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-hero-label">WELCOME TO STUDENT ADVISOR AI</span>
          <h1 className="landing-hero-title">
            AI That Transforms Student Data Into
            <span className="landing-hero-highlight"> Actionable Insights</span>
          </h1>
          <p className="landing-hero-description">
            Upload your student data and let our AI instantly predict pass probabilities,
            identify at-risk students, and generate personalized intervention plans—all in one platform
          </p>
          <div className="landing-hero-buttons">
            <button
              className="landing-btn landing-btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              Get Started
            </button>
            <button
              className="landing-btn landing-btn-secondary"
              onClick={() => navigate('/upload')}
            >
              Upload Data
            </button>
          </div>
        </div>
        <div className="landing-hero-gradient"></div>
      </section>

      {/* How It Works Section */}
      <section className="landing-how-it-works">
        <span className="landing-section-label">HOW IT WORKS</span>
        <h2 className="landing-section-title">So Easy, It Feels Like Magic</h2>
        
        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step-number">1</div>
            <h3 className="landing-step-title">Upload Your Data</h3>
            <p className="landing-step-description">
              Drop in your CSV file with student data. Our system automatically
              parses and extracts key academic metrics.
            </p>
          </div>

          <div className="landing-step">
            <div className="landing-step-number">2</div>
            <h3 className="landing-step-title">Get AI Predictions</h3>
            <p className="landing-step-description">
              Instantly receive ML-powered pass probability predictions,
              risk assessments, and weak topic identification.
            </p>
          </div>

          <div className="landing-step">
            <div className="landing-step-number">3</div>
            <h3 className="landing-step-title">Personalized Action Plans</h3>
            <p className="landing-step-description">
              Access optimized study plans, intervention strategies,
              and AI-generated recommendations for each student.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <span className="landing-section-label">FEATURES</span>
        <h2 className="landing-section-title">Everything You Need In One Platform</h2>
        
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon">🎯</div>
            <h3 className="landing-feature-title">ML Predictions</h3>
            <p className="landing-feature-description">
              Advanced machine learning models predict student pass probabilities with high accuracy
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">⚠️</div>
            <h3 className="landing-feature-title">Risk Detection</h3>
            <p className="landing-feature-description">
              Automatically identify high, medium, and low-risk students for early intervention
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">🤖</div>
            <h3 className="landing-feature-title">AI Advisor</h3>
            <p className="landing-feature-description">
              Chat with our AI to get insights, ask questions, and receive personalized recommendations
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">⚡</div>
            <h3 className="landing-feature-title">DP Study Plans</h3>
            <p className="landing-feature-description">
              Dynamic programming algorithms optimize study time allocation for maximum impact
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">📊</div>
            <h3 className="landing-feature-title">Analytics Dashboard</h3>
            <p className="landing-feature-description">
              Comprehensive visualizations and reports for data-driven decision making
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">🎓</div>
            <h3 className="landing-feature-title">Intervention Plans</h3>
            <p className="landing-feature-description">
              Personalized intervention strategies with quiz generation and revision schedules
            </p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="landing-technology">
        <span className="landing-section-label">POWERED BY</span>
        <h2 className="landing-section-title">Cutting-Edge Technology Stack</h2>
        
        <div className="landing-tech-badges">
          <div className="landing-tech-badge">
            <span className="landing-tech-icon">☁️</span>
            <span className="landing-tech-name">AWS Cloud</span>
          </div>
          <div className="landing-tech-badge">
            <span className="landing-tech-icon">🧠</span>
            <span className="landing-tech-name">Machine Learning</span>
          </div>
          <div className="landing-tech-badge">
            <span className="landing-tech-icon">✨</span>
            <span className="landing-tech-name">Generative AI</span>
          </div>
          <div className="landing-tech-badge">
            <span className="landing-tech-icon">⚛️</span>
            <span className="landing-tech-name">React</span>
          </div>
          <div className="landing-tech-badge">
            <span className="landing-tech-icon">🐍</span>
            <span className="landing-tech-name">FastAPI</span>
          </div>
          <div className="landing-tech-badge">
            <span className="landing-tech-icon">🔢</span>
            <span className="landing-tech-name">Dynamic Programming</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-cta-content">
          <h2 className="landing-cta-title">Ready to Transform Your Student Analytics?</h2>
          <p className="landing-cta-description">
            Start making data-driven decisions today with our AI-powered platform
          </p>
          <div className="landing-cta-buttons">
            <button
              className="landing-btn landing-btn-primary landing-btn-large"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
            <button
              className="landing-btn landing-btn-secondary landing-btn-large"
              onClick={() => navigate('/advisor')}
            >
              Try AI Advisor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
