import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, askAdvisor } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import './Interventions.css';

export default function Interventions() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [expandedCards, setExpandedCards] = useState({});
  const [revisionPlan, setRevisionPlan] = useState(null);
  const [loadingRevision, setLoadingRevision] = useState(false);

  useEffect(() => {
    document.title = 'Interventions – Student Advisor AI';
    
    let cancelled = false;
    getStudents()
      .then((res) => {
        if (cancelled) return;
        const list = res.students || [];
        setStudents(list);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err.message || 'Failed to load data';
          setError(msg);
          addToast(msg, 'error');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    
    return () => { 
      cancelled = true;
      document.title = 'Student Advisor AI'; 
    };
  }, [addToast]);

  const studentsNeedingHelp = useMemo(() => {
    let filtered = students.filter(s => {
      const risk = String(s.risk_level || '').toUpperCase();
      return risk === 'HIGH' || risk === 'MEDIUM';
    });

    if (filterRisk !== 'ALL') {
      filtered = filtered.filter(s => String(s.risk_level || '').toUpperCase() === filterRisk);
    }

    return filtered.map(s => ({
      id: s.student_id || s.id || s.record_id || 'N/A',
      passProb: Number(s.pass_probability) || 0,
      riskLevel: String(s.risk_level || '').toUpperCase(),
      weakTopics: (s.weak_topics || []).filter(t => 
        t && 
        t.toLowerCase() !== 'name' && 
        t.toLowerCase() !== 'null' && 
        t.toLowerCase() !== 'undefined'
      ),
      attendance: Number(s.attendance) || 0,
      internalMarks: Number(s.internal_marks) || 0,
      assignmentMarks: Number(s.assignment_marks) || 0,
      gpa: Number(s.previous_gpa) || 0,
    }));
  }, [students, filterRisk]);

  const toggleExpand = (studentId, section) => {
    setExpandedCards(prev => ({
      ...prev,
      [`${studentId}-${section}`]: !prev[`${studentId}-${section}`]
    }));
  };

  const handleGenerateQuiz = (topics) => {
    addToast(`Quiz generation for: ${topics.slice(0, 2).join(', ')}...`, 'info');
  };

  const handleStartRevision = async (student) => {
    if (student.weakTopics.length === 0) {
      addToast('No topics available for revision', 'error');
      return;
    }
    
    setLoadingRevision(true);
    setRevisionPlan({ studentId: student.id, content: null });
    
    try {
      const topicList = student.weakTopics.slice(0, 5).join(', ');
      const message = `Create a detailed revision plan for student ${student.id} for these topics: ${topicList}`;
      
      const response = await askAdvisor(message);
      setRevisionPlan({ 
        studentId: student.id, 
        content: response.message || response.data?.message || 'Revision plan generated',
        topics: student.weakTopics
      });
    } catch (error) {
      addToast('Failed to generate revision plan', 'error');
      setRevisionPlan(null);
    } finally {
      setLoadingRevision(false);
    }
  };

  const handleViewDetails = (studentId) => {
    navigate(`/student/${studentId}`);
  };

  if (loading) {
    return (
      <div className="interventions-page">
        <div className="interventions-loading">
          <div className="skeleton" style={{ height: 200, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 400 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interventions-page">
        <div className="interventions-error">
          <span className="interventions-error-icon">⚠</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interventions-page">
      <header className="interventions-header">
        <div>
          <h1 className="interventions-title">🎯 Academic Interventions</h1>
          <p className="interventions-subtitle">Personalized support plans for students needing help</p>
        </div>
        <div className="interventions-stats">
          <div className="interventions-stat">
            <span className="interventions-stat-value">{studentsNeedingHelp.length}</span>
            <span className="interventions-stat-label">Students Need Help</span>
          </div>
        </div>
      </header>

      <div className="interventions-filters">
        <button
          className={`interventions-filter-btn ${filterRisk === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterRisk('ALL')}
        >
          All ({students.filter(s => {
            const risk = String(s.risk_level || '').toUpperCase();
            return risk === 'HIGH' || risk === 'MEDIUM';
          }).length})
        </button>
        <button
          className={`interventions-filter-btn ${filterRisk === 'HIGH' ? 'active' : ''}`}
          onClick={() => setFilterRisk('HIGH')}
        >
          High Risk ({students.filter(s => String(s.risk_level || '').toUpperCase() === 'HIGH').length})
        </button>
        <button
          className={`interventions-filter-btn ${filterRisk === 'MEDIUM' ? 'active' : ''}`}
          onClick={() => setFilterRisk('MEDIUM')}
        >
          Medium Risk ({students.filter(s => String(s.risk_level || '').toUpperCase() === 'MEDIUM').length})
        </button>
      </div>

      {studentsNeedingHelp.length === 0 ? (
        <div className="interventions-empty">
          <span className="interventions-empty-icon">✅</span>
          <h2>No Students Need Intervention</h2>
          <p>All students are performing well. Great job!</p>
        </div>
      ) : (
        <div className="interventions-grid">
          {studentsNeedingHelp.map((student) => {
            const isAIPlanExpanded = expandedCards[`${student.id}-ai`];

            return (
              <div key={student.id} className="intervention-card-compact">
                {/* Header */}
                <div className="intervention-header-compact">
                  <div className="intervention-student-info-compact">
                    <h3 className="intervention-student-id-compact">Student {student.id}</h3>
                    <span className={`intervention-risk-badge-compact risk-${student.riskLevel.toLowerCase()}`}>
                      {student.riskLevel}
                    </span>
                  </div>
                  <div className="intervention-pass-compact">
                    <span className="pass-value">{(student.passProb * 100).toFixed(0)}%</span>
                    <span className="pass-label">Pass</span>
                  </div>
                </div>

                {/* Body - Two Columns */}
                <div className="intervention-body-compact">
                  {/* Left: Info */}
                  <div className="intervention-left-compact">
                    {student.weakTopics.length > 0 && (
                      <div className="weak-topics-compact">
                        <span className="section-label"> Weak Subjects</span>
                        <div className="topics-list">
                          {student.weakTopics.slice(0, 3).map((topic, idx) => (
                            <span key={idx} className="topic-tag-compact">{topic}</span>
                          ))}
                          {student.weakTopics.length > 3 && (
                            <span className="topic-more">+{student.weakTopics.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="actions-compact">
                      <button
                        className="action-btn-text btn-quiz"
                        onClick={() => handleGenerateQuiz(student.weakTopics)}
                        disabled={student.weakTopics.length === 0}
                      >
                        Generate Quiz
                      </button>
                      <button
                        className="action-btn-text btn-revision"
                        onClick={() => handleStartRevision(student)}
                        disabled={student.weakTopics.length === 0 || loadingRevision}
                      >
                        Start Revision
                      </button>
                      <button
                        className="action-btn-text btn-details"
                        onClick={() => handleViewDetails(student.id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Right: Plans */}
                  <div className="intervention-right-compact">
                    {/* AI Study Plan */}
                    <div className="plan-section-compact">
                      <button 
                        className="plan-toggle-compact"
                        onClick={() => toggleExpand(student.id, 'ai')}
                      >
                        <span>🤖 AI Study Plan</span>
                        <span className="toggle-icon">{isAIPlanExpanded ? '▼' : '▶'}</span>
                      </button>
                      
                      {isAIPlanExpanded && (
                        <div className="plan-content-compact">
                          {student.attendance < 75 && (
                            <div className="plan-item-compact priority-high">
                              <strong>Improve Attendance</strong>
                              <p>Current: {student.attendance.toFixed(0)}% → Target: 85%+</p>
                            </div>
                          )}
                          {student.assignmentMarks < 60 && (
                            <div className="plan-item-compact priority-high">
                              <strong>Assignment Support</strong>
                              <p>Current score: {student.assignmentMarks.toFixed(0)}%</p>
                            </div>
                          )}
                          {student.weakTopics.length > 0 && (
                            <div className="plan-item-compact priority-medium">
                              <strong>Subject-Specific Support</strong>
                              <p>Focus on: {student.weakTopics.slice(0, 2).join(', ')}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* DP Optimized Study Plan */}
                    {student.weakTopics.length > 0 && (
                      <div className="plan-section-compact">
                        <button 
                          className="plan-toggle-compact"
                          onClick={() => toggleExpand(student.id, 'dp')}
                        >
                          <span>⚡ Optimized Plan (DP)</span>
                          <span className="toggle-icon">{expandedCards[`${student.id}-dp`] ? '▼' : '▶'}</span>
                        </button>
                        
                        {expandedCards[`${student.id}-dp`] && (
                          <div className="plan-content-compact">
                            <div className="dp-metrics-mini">
                              <div className="dp-metric-mini">
                                <span className="metric-label">Coverage</span>
                                <span className="metric-value">85%</span>
                              </div>
                              <div className="dp-metric-mini">
                                <span className="metric-label">Hours</span>
                                <span className="metric-value">20h</span>
                              </div>
                              <div className="dp-metric-mini">
                                <span className="metric-label">Impact</span>
                                <span className="metric-value">High</span>
                              </div>
                            </div>
                            <div className="dp-subjects-mini">
                              {student.weakTopics.slice(0, 3).map((topic, idx) => (
                                <div key={idx} className="dp-subject-mini">
                                  <span className="subject-name">{topic}</span>
                                  <span className="subject-hours">{Math.ceil(20 / student.weakTopics.length)}h</span>
                                </div>
                              ))}
                            </div>
                            <button 
                              className="view-full-plan-btn"
                              onClick={() => navigate(`/student/${student.id}`)}
                            >
                              View Full Plan →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Revision Plan Modal */}
      {revisionPlan && (
        <div className="revision-modal-overlay" onClick={() => setRevisionPlan(null)}>
          <div className="revision-modal" onClick={(e) => e.stopPropagation()}>
            <div className="revision-modal-header">
              <h2 className="revision-modal-title">
                📚 Revision Plan - Student {revisionPlan.studentId}
              </h2>
              <button 
                className="revision-modal-close"
                onClick={() => setRevisionPlan(null)}
              >
                ✕
              </button>
            </div>
            
            {revisionPlan.topics && (
              <div className="revision-modal-topics">
                <strong>Topics:</strong> {revisionPlan.topics.join(', ')}
              </div>
            )}
            
            <div className="revision-modal-content">
              {loadingRevision ? (
                <div className="revision-modal-loading">
                  <div className="spinner"></div>
                  <p>Generating revision plan...</p>
                </div>
              ) : revisionPlan.content ? (
                <div className="revision-plan-text">
                  {revisionPlan.content.split('\n').map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;
                    
                    if (trimmed.toLowerCase().includes('identified weaknesses') ||
                        trimmed.toLowerCase().includes('pass probability') ||
                        /\(id \d+\)/i.test(trimmed)) {
                      return null;
                    }
                    
                    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                      return <h3 key={idx} className="revision-heading">{trimmed.replace(/\*\*/g, '')}</h3>;
                    }
                    if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
                      return <li key={idx} className="revision-list-item">{trimmed.substring(1).trim()}</li>;
                    }
                    if (/^\d+\./.test(trimmed)) {
                      return <li key={idx} className="revision-list-numbered">{trimmed.replace(/^\d+\.\s*/, '')}</li>;
                    }
                    return <p key={idx} className="revision-paragraph">{trimmed}</p>;
                  })}
                </div>
              ) : (
                <p>No revision plan available</p>
              )}
            </div>
            
            {revisionPlan.content && !loadingRevision && (
              <div className="revision-modal-footer">
                <button 
                  className="revision-download-btn"
                  onClick={() => {
                    const blob = new Blob([revisionPlan.content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `revision-plan-student-${revisionPlan.studentId}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  📥 Download Plan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
