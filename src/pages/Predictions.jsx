import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { getStudents } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import './Predictions.css';

export default function Predictions() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('risk'); // 'risk', 'probability', 'id'
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Predictions – Student Advisor AI';
    
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

  // Process and sort students
  const processedStudents = useMemo(() => {
    let processed = students.map(s => ({
      id: s.student_id || s.id || s.record_id || 'N/A',
      passProb: Number(s.pass_probability) || 0,
      passProbPercent: ((Number(s.pass_probability) || 0) * 100).toFixed(1),
      riskLevel: String(s.risk_level || '').toUpperCase(),
      weakTopics: s.weak_topics || [],
      attendance: Number(s.attendance) || 0,
      internalMarks: Number(s.internal_marks) || 0,
      assignmentMarks: Number(s.assignment_marks) || 0,
      gpa: Number(s.previous_gpa) || 0,
      rawData: s
    }));

    // Filter by risk level
    if (filterRisk !== 'ALL') {
      processed = processed.filter(s => s.riskLevel === filterRisk);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      processed = processed.filter(s => 
        s.id.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'risk') {
      const riskOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
      processed.sort((a, b) => {
        const orderA = riskOrder[a.riskLevel] ?? 3;
        const orderB = riskOrder[b.riskLevel] ?? 3;
        if (orderA !== orderB) return orderA - orderB;
        return a.passProb - b.passProb; // Secondary sort by probability
      });
    } else if (sortBy === 'probability') {
      processed.sort((a, b) => a.passProb - b.passProb);
    } else if (sortBy === 'id') {
      processed.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    }

    return processed;
  }, [students, sortBy, filterRisk, searchQuery]);

  // Prediction Summary Statistics
  const predictionSummary = useMemo(() => {
    if (students.length === 0) return null;

    const high = students.filter(s => String(s.risk_level || '').toUpperCase() === 'HIGH').length;
    const medium = students.filter(s => String(s.risk_level || '').toUpperCase() === 'MEDIUM').length;
    const low = students.filter(s => String(s.risk_level || '').toUpperCase() === 'LOW').length;
    
    const avgPassProb = students.reduce((sum, s) => sum + (Number(s.pass_probability) || 0), 0) / students.length;
    const passCount = students.filter(s => (Number(s.pass_probability) || 0) >= 0.5).length;
    const failCount = students.length - passCount;

    return {
      total: students.length,
      high,
      medium,
      low,
      avgPassProb: (avgPassProb * 100).toFixed(1),
      passCount,
      failCount,
      passRate: ((passCount / students.length) * 100).toFixed(1)
    };
  }, [students]);

  // Pass Probability Distribution
  const probabilityDistribution = useMemo(() => {
    const ranges = [
      { range: '0-20%', min: 0, max: 0.2, count: 0, color: '#ef4444' },
      { range: '20-40%', min: 0.2, max: 0.4, count: 0, color: '#f97316' },
      { range: '40-60%', min: 0.4, max: 0.6, count: 0, color: '#f59e0b' },
      { range: '60-80%', min: 0.6, max: 0.8, count: 0, color: '#84cc16' },
      { range: '80-100%', min: 0.8, max: 1.0, count: 0, color: '#22c55e' },
    ];
    
    students.forEach(s => {
      const prob = Number(s.pass_probability) || 0;
      const range = ranges.find(r => prob >= r.min && prob < r.max) || ranges[ranges.length - 1];
      range.count++;
    });
    
    return ranges;
  }, [students]);

  // Risk Distribution for Pie Chart
  const riskDistribution = useMemo(() => {
    if (!predictionSummary) return [];
    
    return [
      { name: 'High Risk', value: predictionSummary.high, color: '#ef4444' },
      { name: 'Medium Risk', value: predictionSummary.medium, color: '#f59e0b' },
      { name: 'Low Risk', value: predictionSummary.low, color: '#22c55e' },
    ].filter(item => item.value > 0);
  }, [predictionSummary]);

  const handleViewStudent = (studentId) => {
    navigate(`/student/${studentId}`);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'HIGH': return 'var(--risk-high)';
      case 'MEDIUM': return 'var(--risk-medium)';
      case 'LOW': return 'var(--risk-low)';
      default: return 'var(--text-muted)';
    }
  };

  const getProbabilityColor = (prob) => {
    if (prob < 0.3) return '#ef4444';
    if (prob < 0.5) return '#f59e0b';
    if (prob < 0.7) return '#84cc16';
    return '#22c55e';
  };

  if (loading) {
    return (
      <div className="predictions-page">
        <div className="predictions-loading">
          <div className="skeleton" style={{ height: 200, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 400 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="predictions-page">
        <div className="predictions-error">
          <span className="predictions-error-icon">⚠</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="predictions-page">
      <header className="predictions-header">
        <div>
          <h1 className="predictions-title">🎯 ML Predictions</h1>
          <p className="predictions-subtitle">Pass probability predictions and risk analysis</p>
        </div>
      </header>

      {/* Prediction Summary Cards */}
      {predictionSummary && (
        <div className="predictions-summary">
          <div className="predictions-summary-card">
            <span className="predictions-summary-label">Total Students</span>
            <span className="predictions-summary-value">{predictionSummary.total}</span>
          </div>
          <div className="predictions-summary-card predictions-summary-card-success">
            <span className="predictions-summary-label">Predicted Pass</span>
            <span className="predictions-summary-value">{predictionSummary.passCount}</span>
            <span className="predictions-summary-percent">{predictionSummary.passRate}%</span>
          </div>
          <div className="predictions-summary-card predictions-summary-card-danger">
            <span className="predictions-summary-label">Predicted Fail</span>
            <span className="predictions-summary-value">{predictionSummary.failCount}</span>
            <span className="predictions-summary-percent">{((predictionSummary.failCount / predictionSummary.total) * 100).toFixed(1)}%</span>
          </div>
          <div className="predictions-summary-card predictions-summary-card-info">
            <span className="predictions-summary-label">Avg Pass Probability</span>
            <span className="predictions-summary-value">{predictionSummary.avgPassProb}%</span>
          </div>
        </div>
      )}

      {/* Prediction Charts */}
      <div className="predictions-charts">
        <div className="predictions-chart-card">
          <h3 className="predictions-chart-title">Pass Probability Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={probabilityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="range" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fill: 'var(--text-muted)' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {probabilityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="predictions-chart-card">
          <h3 className="predictions-chart-title">Risk Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls */}
      <div className="predictions-controls">
        <div className="predictions-search">
          <input
            type="text"
            placeholder="Search by Student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="predictions-search-input"
          />
        </div>

        <div className="predictions-filters">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="predictions-select"
          >
            <option value="risk">Sort by Risk (High → Low)</option>
            <option value="probability">Sort by Probability (Low → High)</option>
            <option value="id">Sort by Student ID</option>
          </select>

          <div className="predictions-risk-filters">
            <button
              className={`predictions-risk-filter ${filterRisk === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterRisk('ALL')}
            >
              All
            </button>
            <button
              className={`predictions-risk-filter ${filterRisk === 'HIGH' ? 'active' : ''}`}
              onClick={() => setFilterRisk('HIGH')}
            >
              High Risk
            </button>
            <button
              className={`predictions-risk-filter ${filterRisk === 'MEDIUM' ? 'active' : ''}`}
              onClick={() => setFilterRisk('MEDIUM')}
            >
              Medium Risk
            </button>
            <button
              className={`predictions-risk-filter ${filterRisk === 'LOW' ? 'active' : ''}`}
              onClick={() => setFilterRisk('LOW')}
            >
              Low Risk
            </button>
          </div>
        </div>
      </div>

      {/* Student Predictions List */}
      <div className="predictions-list">
        <div className="predictions-list-header">
          <h2 className="predictions-list-title">
            Student Predictions ({processedStudents.length})
          </h2>
        </div>

        {processedStudents.length === 0 ? (
          <div className="predictions-empty">
            <span className="predictions-empty-icon">🔍</span>
            <p>No students found matching your filters</p>
          </div>
        ) : (
          <div className="predictions-grid">
            {processedStudents.map((student) => (
              <div
                key={student.id}
                className="prediction-card"
                onClick={() => handleViewStudent(student.id)}
              >
                <div className="prediction-card-header">
                  <div className="prediction-student-info">
                    <h3 className="prediction-student-id">Student {student.id}</h3>
                    <span
                      className="prediction-risk-badge"
                      style={{ 
                        background: `${getRiskColor(student.riskLevel)}20`,
                        color: getRiskColor(student.riskLevel),
                        borderColor: `${getRiskColor(student.riskLevel)}40`
                      }}
                    >
                      {student.riskLevel} RISK
                    </span>
                  </div>
                </div>

                <div className="prediction-probability">
                  <div className="prediction-probability-label">Pass Probability</div>
                  <div className="prediction-probability-value" style={{ color: getProbabilityColor(student.passProb) }}>
                    {student.passProbPercent}%
                  </div>
                  <div className="prediction-probability-bar">
                    <div
                      className="prediction-probability-fill"
                      style={{
                        width: `${student.passProbPercent}%`,
                        background: getProbabilityColor(student.passProb)
                      }}
                    />
                  </div>
                </div>

                {student.weakTopics.length > 0 && (
                  <div className="prediction-weak-topics">
                    <span className="prediction-weak-label">Weak Topics:</span>
                    <span className="prediction-weak-count">{student.weakTopics.length} topic(s)</span>
                  </div>
                )}

                <div className="prediction-metrics">
                  <div className="prediction-metric">
                    <span className="prediction-metric-label">Attendance</span>
                    <span className="prediction-metric-value">{student.attendance.toFixed(1)}%</span>
                  </div>
                  <div className="prediction-metric">
                    <span className="prediction-metric-label">Internal</span>
                    <span className="prediction-metric-value">{student.internalMarks.toFixed(1)}</span>
                  </div>
                  <div className="prediction-metric">
                    <span className="prediction-metric-label">Assignment</span>
                    <span className="prediction-metric-value">{student.assignmentMarks.toFixed(1)}</span>
                  </div>
                </div>

                <button className="prediction-view-btn">
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
