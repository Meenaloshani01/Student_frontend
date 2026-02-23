import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentById, askAdvisor } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import RadarChart from '../components/RadarChart';
import AnalysisCard from '../components/AnalysisCard';
import QuizDisplay from '../components/QuizDisplay';
import './StudentDetail.css';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setLoading(false);
      return;
    }
    getStudentById(id)
      .then((data) => {
        if (!cancelled) setStudent(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load student');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleAnalyzeRisk = () => {
    if (!id || !student) return;
    const sid = student.student_id ?? 'S' + id;
    setLoadingAnalysis(true);
    setAnalysis(null);
    askAdvisor(`Why is student ${sid} at risk?`)
      .then((res) => {
        setAnalysis(res.data || res);
      })
      .catch(() => {
        setAnalysis({ summary: 'Unable to fetch analysis.' });
      })
      .finally(() => setLoadingAnalysis(false));
  };

  const handleGenerateQuiz = () => {
    if (!id || !student) return;
    const sid = student.student_id ?? 'S' + id;
    setLoadingQuiz(true);
    setQuiz(null);
    askAdvisor(`Generate quiz for student ${sid}`)
      .then((res) => {
        setQuiz(res.data || res);
      })
      .catch(() => {
        setQuiz({});
      })
      .finally(() => setLoadingQuiz(false));
  };

  const passPct = student
    ? Math.round(Number(student.pass_probability) * 100) || 0
    : 0;
  const riskLevel = student ? String(student.risk_level || '').toUpperCase() : '';
  const isHighRisk = riskLevel === 'HIGH';

  if (loading) {
    return (
      <div className="student-detail">
        <div className="student-detail-skeleton">
          <div className="skeleton" style={{ height: 120, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 280, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="student-detail">
        <div className="student-detail-error">
          <p>{error || 'Student not found'}</p>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-detail">
      <button type="button" className="student-detail-back" onClick={() => navigate('/')}>
        ← Back to Dashboard
      </button>

      <div className="student-detail-header">
        <h1 className="student-detail-title">Student {student.student_id}</h1>
        <RiskBadge level={student.risk_level} />
      </div>

      <div className="student-detail-grid">
        <div className="student-info-card">
          <h3 className="student-info-title">Metrics</h3>
          <div className="student-info-grid">
            <div className="student-info-item">
              <span className="student-info-label">Attendance</span>
              <span className="student-info-value">{student.attendance ?? '—'}</span>
            </div>
            <div className="student-info-item">
              <span className="student-info-label">Internal marks</span>
              <span className="student-info-value">{student.internal_marks ?? '—'}</span>
            </div>
            <div className="student-info-item">
              <span className="student-info-label">Assignment marks</span>
              <span className="student-info-value">{student.assignment_marks ?? '—'}</span>
            </div>
            <div className="student-info-item">
              <span className="student-info-label">Previous GPA</span>
              <span className="student-info-value">{student.previous_gpa ?? '—'}</span>
            </div>
            <div className="student-info-item">
              <span className="student-info-label">Pass probability</span>
              <span className={`student-info-value student-info-value--pct student-info-value--${passPct < 40 ? 'high' : passPct < 65 ? 'medium' : 'low'}`}>
                {passPct}%
              </span>
            </div>
          </div>
          {(student.weak_topics || []).length > 0 && (
            <div className="student-weak-topics">
              <span className="student-info-label">Weak topics</span>
              <div className="student-weak-chips">
                {student.weak_topics.map((t) => (
                  <span key={t} className="weak-topic-chip">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="student-radar-card">
          <h3 className="student-info-title">Topic scores</h3>
          <RadarChart topicScores={student.topic_scores || {}} />
        </div>
      </div>

      <div className="student-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAnalyzeRisk}
          disabled={loadingAnalysis}
        >
          {loadingAnalysis ? 'Analyzing…' : 'Analyze Risk'}
        </button>
        {isHighRisk && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleGenerateQuiz}
            disabled={loadingQuiz}
          >
            {loadingQuiz ? 'Generating…' : 'Generate Quiz'}
          </button>
        )}
      </div>

      {analysis && (
        <div className="student-analysis-section">
          <h2 className="student-section-title">Risk analysis</h2>
          <AnalysisCard data={analysis} />
        </div>
      )}

      {quiz && Object.keys(quiz).length > 0 && (
        <div className="student-quiz-section">
          <h2 className="student-section-title">Generated quiz</h2>
          <QuizDisplay data={quiz} />
        </div>
      )}
    </div>
  );
}
