import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStudentById, askAdvisor, uploadCSV } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import RiskBadge from '../components/RiskBadge';
import RadarChart from '../components/RadarChart';
import AnalysisCard from '../components/AnalysisCard';
import QuizDisplay from '../components/QuizDisplay';
import './StudentDetail.css';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    if (student?.student_id) {
      document.title = `Student ${student.student_id} – Student Advisor AI`;
    }
    return () => { document.title = 'Student Advisor AI'; };
  }, [student?.student_id]);

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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      performUpload(file);
    }
  };

  const performUpload = async (file) => {
    setUploadingCSV(true);
    try {
      const response = await uploadCSV(file);
      addToast(response.message || 'CSV uploaded successfully', 'success');
      // Clear file input value after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      let errorMessage = 'Failed to upload CSV';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timed out. Please try again.';
      } else if (error.response) {
        errorMessage = error.response.data?.detail 
          || error.response.data?.message 
          || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      addToast(errorMessage, 'error');
      // Clear file input value after error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploadingCSV(false);
    }
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
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-detail">
      <nav className="student-breadcrumb" aria-label="Breadcrumb">
        <Link to="/dashboard" className="student-breadcrumb-link">Dashboard</Link>
        <span className="student-breadcrumb-sep">→</span>
        <span className="student-breadcrumb-current">Student {student.student_id}</span>
      </nav>
      <button type="button" className="student-detail-back" onClick={() => navigate('/dashboard')}>
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
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleUploadClick}
          disabled={uploadingCSV}
          aria-label="Upload CSV file for student data analysis"
        >
          {uploadingCSV ? 'Uploading…' : 'Upload CSV'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
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
