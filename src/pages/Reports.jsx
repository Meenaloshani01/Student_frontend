import { useState, useEffect, useMemo } from 'react';
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
import './Reports.css';

export default function Reports() {
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Reports – Student Advisor AI';
    
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

  // 1. Pass Percentage Report
  const passPercentageReport = useMemo(() => {
    if (students.length === 0) return null;
    
    const totalPass = students.filter(s => (Number(s.pass_probability) || 0) >= 0.5).length;
    const overallPassRate = ((totalPass / students.length) * 100).toFixed(1);
    
    // Department-wise
    const deptMap = {};
    students.forEach(s => {
      const dept = s.department || s.Department || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = { total: 0, passed: 0 };
      }
      deptMap[dept].total++;
      if ((Number(s.pass_probability) || 0) >= 0.5) {
        deptMap[dept].passed++;
      }
    });
    
    const departmentData = Object.entries(deptMap).map(([dept, data]) => ({
      department: dept,
      passRate: Number(((data.passed / data.total) * 100).toFixed(1)),
      total: data.total
    }));
    
    // Subject-wise
    const subjectMap = {};
    students.forEach(s => {
      const topics = s.weak_topics || [];
      const passProb = Number(s.pass_probability) || 0;
      topics.forEach(topic => {
        if (!subjectMap[topic]) {
          subjectMap[topic] = { total: 0, totalProb: 0 };
        }
        subjectMap[topic].total++;
        subjectMap[topic].totalProb += passProb;
      });
    });
    
    const subjectData = Object.entries(subjectMap)
      .map(([subject, data]) => ({
        subject,
        passRate: Number(((data.totalProb / data.total) * 100).toFixed(1)),
        students: data.total
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 8);
    
    return { overallPassRate, departmentData, subjectData };
  }, [students]);

  // 2. Risk Analysis Report
  const riskAnalysis = useMemo(() => {
    const high = students.filter(s => String(s.risk_level || '').toUpperCase() === 'HIGH').length;
    const medium = students.filter(s => String(s.risk_level || '').toUpperCase() === 'MEDIUM').length;
    const low = students.filter(s => String(s.risk_level || '').toUpperCase() === 'LOW').length;
    
    const pieData = [
      { name: 'High Risk', value: high, color: '#ef4444' },
      { name: 'Medium Risk', value: medium, color: '#f59e0b' },
      { name: 'Low Risk', value: low, color: '#22c55e' },
    ];
    
    // Class-wise breakdown
    const classMap = {};
    students.forEach(s => {
      const cls = s.class || s.Class || s.year || s.Year || 'Unknown';
      const risk = String(s.risk_level || '').toUpperCase();
      if (!classMap[cls]) {
        classMap[cls] = { high: 0, medium: 0, low: 0 };
      }
      if (risk === 'HIGH') classMap[cls].high++;
      else if (risk === 'MEDIUM') classMap[cls].medium++;
      else if (risk === 'LOW') classMap[cls].low++;
    });
    
    const classData = Object.entries(classMap).map(([cls, data]) => ({
      class: cls,
      high: data.high,
      medium: data.medium,
      low: data.low
    }));
    
    return { pieData, classData, high, medium, low };
  }, [students]);

  // 3. Subject Difficulty Analysis
  const subjectDifficulty = useMemo(() => {
    const topicMap = {};
    students.forEach(s => {
      (s.weak_topics || []).forEach(topic => {
        if (!topicMap[topic]) {
          topicMap[topic] = { topic, failCount: 0, totalStudents: 0, totalPass: 0 };
        }
        topicMap[topic].totalStudents++;
        const passProb = Number(s.pass_probability) || 0;
        topicMap[topic].totalPass += passProb;
        if (passProb < 0.5) {
          topicMap[topic].failCount++;
        }
      });
    });
    
    return Object.values(topicMap)
      .map(t => ({
        ...t,
        failureRate: Number(((t.failCount / t.totalStudents) * 100).toFixed(1)),
        avgPass: Number(((t.totalPass / t.totalStudents) * 100).toFixed(1))
      }))
      .sort((a, b) => b.failureRate - a.failureRate)
      .slice(0, 10);
  }, [students]);

  // 4. Performance Distribution Trend
  const performanceTrend = useMemo(() => {
    const ranges = [
      { range: 'Very Low (0-20%)', count: 0 },
      { range: 'Low (20-40%)', count: 0 },
      { range: 'Medium (40-60%)', count: 0 },
      { range: 'Good (60-80%)', count: 0 },
      { range: 'Excellent (80-100%)', count: 0 },
    ];
    
    students.forEach(s => {
      const prob = Number(s.pass_probability) || 0;
      const probPercent = prob * 100;
      if (probPercent < 20) ranges[0].count++;
      else if (probPercent < 40) ranges[1].count++;
      else if (probPercent < 60) ranges[2].count++;
      else if (probPercent < 80) ranges[3].count++;
      else ranges[4].count++;
    });
    
    return ranges;
  }, [students]);

  // 5. At-Risk Student Summary
  const atRiskSummary = useMemo(() => {
    return students
      .filter(s => String(s.risk_level || '').toUpperCase() === 'HIGH')
      .map(s => ({
        id: s.student_id || s.id || s.record_id || 'N/A',
        department: s.department || s.Department || 'N/A',
        passProb: ((Number(s.pass_probability) || 0) * 100).toFixed(1),
        weakTopics: (s.weak_topics || []).slice(0, 3).join(', ') || 'N/A'
      }))
      .slice(0, 15);
  }, [students]);

  const handleExportCSV = () => {
    if (students.length === 0) {
      addToast('No data to export', 'info');
      return;
    }
    
    const headers = ['Student ID', 'Pass Probability', 'Risk Level', 'Weak Topics'];
    const rows = students.map(s => [
      s.student_id || s.id || 'N/A',
      ((Number(s.pass_probability) || 0) * 100).toFixed(1) + '%',
      s.risk_level || 'N/A',
      (s.weak_topics || []).join('; ') || 'None'
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    addToast('Report exported successfully', 'success');
  };

  const handleExportPDF = () => {
    addToast('PDF export feature coming soon', 'info');
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          <div className="skeleton" style={{ height: 200, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 300, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 300 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="reports-error">
          <span className="reports-error-icon">⚠</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div>
          <h1 className="reports-title">📊 Academic Analytics Report</h1>
          <p className="reports-subtitle">Comprehensive performance analysis and insights</p>
        </div>
        <div className="reports-export-group">
          <button
            type="button"
            className="reports-export-btn"
            onClick={handleExportCSV}
            disabled={students.length === 0}
          >
            📄 Export CSV
          </button>
          <button
            type="button"
            className="reports-export-btn reports-export-btn-secondary"
            onClick={handleExportPDF}
            disabled={students.length === 0}
          >
            📑 Export PDF
          </button>
        </div>
      </header>

      {/* 1. Pass Percentage Report */}
      {passPercentageReport && (
        <section className="reports-section">
          <h2 className="reports-section-title">📈 Pass Percentage Report</h2>
          
          <div className="reports-pass-overview">
            <div className="reports-pass-card reports-pass-card-primary">
              <span className="reports-pass-label">Overall Pass Rate</span>
              <span className="reports-pass-value">{passPercentageReport.overallPassRate}%</span>
              <span className="reports-pass-desc">Students with ≥50% pass probability</span>
            </div>
          </div>

          {/* Single combined chart for pass rates */}
          <div className="reports-chart-card">
            <h3 className="reports-chart-title">Department-wise Pass Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={passPercentageReport.departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="department" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="passRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* 2. Risk Analysis Report */}
      <section className="reports-section">
        <h2 className="reports-section-title">⚠️ Risk Analysis Report</h2>
        
        <div className="reports-risk-stats">
          <div className="reports-risk-stat reports-risk-stat-high">
            <span className="reports-risk-stat-value">{riskAnalysis.high}</span>
            <span className="reports-risk-stat-label">High Risk</span>
          </div>
          <div className="reports-risk-stat reports-risk-stat-medium">
            <span className="reports-risk-stat-value">{riskAnalysis.medium}</span>
            <span className="reports-risk-stat-label">Medium Risk</span>
          </div>
          <div className="reports-risk-stat reports-risk-stat-low">
            <span className="reports-risk-stat-value">{riskAnalysis.low}</span>
            <span className="reports-risk-stat-label">Low Risk</span>
          </div>
        </div>

        {/* Single Risk Distribution Pie Chart */}
        <div className="reports-chart-card">
          <h3 className="reports-chart-title">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskAnalysis.pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {riskAnalysis.pieData.map((entry, index) => (
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
      </section>

      {/* 3. Subject Difficulty Analysis */}
      {subjectDifficulty.length > 0 && (
        <section className="reports-section">
          <h2 className="reports-section-title">📚 Subject Difficulty Analysis</h2>
          <p className="reports-section-desc">Subjects with highest failure rates and struggling students</p>
          
          <div className="reports-chart-card">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={subjectDifficulty} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)' }} />
                <YAxis dataKey="topic" type="category" tick={{ fill: 'var(--text-secondary)' }} width={150} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                />
                <Legend />
                <Bar dataKey="failureRate" fill="#ef4444" name="Failure Rate %" radius={[0, 4, 4, 0]} />
                <Bar dataKey="totalStudents" fill="#3b82f6" name="Total Students" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* At-Risk Student Summary */}
      {atRiskSummary.length > 0 && (
        <section className="reports-section">
          <h2 className="reports-section-title">🚨 At-Risk Student Summary</h2>
          <p className="reports-section-desc">High-risk students requiring immediate intervention</p>
          
          <div className="reports-table-card">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Pass Probability</th>
                  <th>Weak Topics</th>
                </tr>
              </thead>
              <tbody>
                {atRiskSummary.map((student, idx) => (
                  <tr key={idx}>
                    <td><strong>{student.id}</strong></td>
                    <td>{student.department}</td>
                    <td>
                      <span className="reports-badge reports-badge-danger">{student.passProb}%</span>
                    </td>
                    <td className="reports-topics">{student.weakTopics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
