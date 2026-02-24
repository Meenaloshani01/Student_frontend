import { useState, useEffect, useCallback } from 'react';
import { getStudents } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import StudentTable from '../components/StudentTable';
import './AtRisk.css';

export default function AtRisk() {
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [highRiskStudents, setHighRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(() => {
    const isRefresh = students.length > 0;
    if (isRefresh) setRefreshing(true);
    setError(null);
    getStudents()
      .then((res) => {
        const list = res.students || [];
        setStudents(list);
        
        // Filter only HIGH risk students
        const highRisk = list.filter(
          (s) => String(s.risk_level || '').toUpperCase() === 'HIGH'
        );
        setHighRiskStudents(highRisk);
        setError(null);
        
        if (isRefresh) addToast('Data refreshed successfully', 'success');
      })
      .catch((err) => {
        const msg = err.message || 'Failed to load students';
        setError(msg);
        addToast(msg, 'error');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [students.length, addToast]);

  useEffect(() => {
    document.title = 'At-Risk Students – Student Advisor AI';
    
    let cancelled = false;
    getStudents()
      .then((res) => {
        if (cancelled) return;
        const list = res.students || [];
        setStudents(list);
        
        // Filter only HIGH risk students
        const highRisk = list.filter(
          (s) => String(s.risk_level || '').toUpperCase() === 'HIGH'
        );
        setHighRiskStudents(highRisk);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err.message || 'Failed to load students';
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

  const highRiskPercentage = students.length > 0 
    ? Math.round((highRiskStudents.length / students.length) * 100)
    : 0;

  return (
    <div className="at-risk-page">
      <header className="at-risk-header">
        <div>
          <h1 className="at-risk-title">At-Risk Students</h1>
          <p className="at-risk-subtitle">
            {loading ? 'Loading...' : (
              <>
                {highRiskStudents.length} high-risk student{highRiskStudents.length !== 1 ? 's' : ''} 
                {students.length > 0 && ` (${highRiskPercentage}% of total)`}
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          className="at-risk-refresh"
          onClick={fetchData}
          disabled={loading || refreshing}
          aria-label="Refresh data"
        >
          <span className="at-risk-refresh-icon">{refreshing ? '⟳' : '↻'}</span>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {error && (
        <div className="at-risk-error">
          <span className="at-risk-error-icon">⚠</span>
          <span>{error}</span>
          <button type="button" className="at-risk-retry" onClick={fetchData}>
            Retry
          </button>
        </div>
      )}

      {!loading && highRiskStudents.length === 0 && !error && (
        <div className="at-risk-empty">
          <span className="at-risk-empty-icon">✅</span>
          <h2 className="at-risk-empty-title">No High-Risk Students</h2>
          <p className="at-risk-empty-text">
            Great news! There are currently no students identified as high-risk.
          </p>
        </div>
      )}

      {!loading && highRiskStudents.length > 0 && (
        <div className="at-risk-alert">
          <span className="at-risk-alert-icon">⚠️</span>
          <div className="at-risk-alert-content">
            <h3 className="at-risk-alert-title">Immediate Attention Required</h3>
            <p className="at-risk-alert-text">
              These students have been identified as high-risk and may need intervention strategies to improve their performance.
            </p>
          </div>
        </div>
      )}

      <StudentTable students={highRiskStudents} loading={loading} />
    </div>
  );
}
