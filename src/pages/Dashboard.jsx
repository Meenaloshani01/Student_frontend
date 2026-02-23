import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getStudents } from '../services/api';
import SummaryCards from '../components/SummaryCards';
import StudentTable from '../components/StudentTable';
import './Dashboard.css';

const RISK_COLORS = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#22c55e',
};

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getStudents()
      .then((res) => {
        if (cancelled) return;
        const list = res.students || [];
        setStudents(list);
        setTotal(Number(res.total) ?? list.length);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load students');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const counts = {
    high: students.filter((s) => String(s.risk_level || '').toUpperCase() === 'HIGH').length,
    medium: students.filter((s) => String(s.risk_level || '').toUpperCase() === 'MEDIUM').length,
    low: students.filter((s) => String(s.risk_level || '').toUpperCase() === 'LOW').length,
  };

  const pieData = [
    { name: 'High Risk', value: counts.high, color: RISK_COLORS.HIGH },
    { name: 'Medium Risk', value: counts.medium, color: RISK_COLORS.MEDIUM },
    { name: 'Low Risk', value: counts.low, color: RISK_COLORS.LOW },
  ].filter((d) => d.value > 0);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Student result analysis and pass prediction</p>
      </header>

      {error && (
        <div className="dashboard-error">
          <span className="dashboard-error-icon">⚠</span>
          {error}
        </div>
      )}

      <SummaryCards
        total={total}
        high={counts.high}
        medium={counts.medium}
        low={counts.low}
      />

      <div className="dashboard-charts-row">
        <div className="dashboard-chart-card">
          <h3 className="dashboard-chart-title">Risk distribution</h3>
          {loading ? (
            <div className="dashboard-chart-skeleton skeleton" />
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="var(--bg-card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                  formatter={(value) => [value, 'Students']}
                />
                <Legend
                  formatter={(value) => value}
                  wrapperStyle={{ fontSize: '0.85rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="dashboard-chart-empty">No risk data to display</p>
          )}
        </div>
      </div>

      <section className="dashboard-table-section">
        <h2 className="dashboard-section-title">All students</h2>
        <StudentTable students={students} loading={loading} />
      </section>
    </div>
  );
}
