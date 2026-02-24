import { useState, useEffect, useCallback } from 'react';
import { getStudents } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import StudentTable from '../components/StudentTable';
import './Students.css';

export default function Students() {
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
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
        setTotal(res.total || list.length);
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
    document.title = 'Students – Student Advisor AI';
    
    let cancelled = false;
    getStudents()
      .then((res) => {
        if (cancelled) return;
        const list = res.students || [];
        setStudents(list);
        setTotal(res.total || list.length);
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

  return (
    <div className="students-page">
      <header className="students-header">
        <div>
          <h1 className="students-title">Students</h1>
          <p className="students-subtitle">
            {loading ? 'Loading...' : `${total} student${total !== 1 ? 's' : ''} enrolled`}
          </p>
        </div>
        <button
          type="button"
          className="students-refresh"
          onClick={fetchData}
          disabled={loading || refreshing}
          aria-label="Refresh data"
        >
          <span className="students-refresh-icon">{refreshing ? '⟳' : '↻'}</span>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {error && (
        <div className="students-error">
          <span className="students-error-icon">⚠</span>
          <span>{error}</span>
          <button type="button" className="students-retry" onClick={fetchData}>
            Retry
          </button>
        </div>
      )}

      <StudentTable students={students} loading={loading} />
    </div>
  );
}
