import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { getStudents } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import SummaryCards from '../components/SummaryCards';
import './Dashboard.css';

const RISK_COLORS = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#22c55e',
};

function parseTotal(res, list) {
  const n = parseInt(res.total, 10);
  return Number.isFinite(n) ? n : (list?.length ?? 0);
}

function computeInsights(students) {
  const n = students.length;
  if (n === 0)
    return {
      avgPassPct: 0,
      atRiskPct: 0,
      topWeakTopic: null,
      passBuckets: [
        { range: '0–40%', count: 0, fill: RISK_COLORS.HIGH },
        { range: '40–65%', count: 0, fill: RISK_COLORS.MEDIUM },
        { range: '65–100%', count: 0, fill: RISK_COLORS.LOW },
      ],
    };
  let sumPass = 0;
  const topicCounts = {};
  const passBuckets = [
    { range: '0–40%', count: 0, fill: RISK_COLORS.HIGH },
    { range: '40–65%', count: 0, fill: RISK_COLORS.MEDIUM },
    { range: '65–100%', count: 0, fill: RISK_COLORS.LOW },
  ];
  students.forEach((s) => {
    const p = Number(s.pass_probability) * 100 || 0;
    sumPass += p;
    if (p < 40) passBuckets[0].count += 1;
    else if (p < 65) passBuckets[1].count += 1;
    else passBuckets[2].count += 1;
    (s.weak_topics || []).forEach((t) => {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });
  });
  const highCount = students.filter(
    (s) => String(s.risk_level || '').toUpperCase() === 'HIGH'
  ).length;
  const topWeakTopic =
    Object.keys(topicCounts).length > 0
      ? Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;
  return {
    avgPassPct: Math.round(sumPass / n),
    atRiskPct: Math.round((highCount / n) * 100),
    topWeakTopic,
    passBuckets,
  };
}

function formatLastUpdated(date) {
  if (!date) return '';
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard() {
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(() => {
    const isRefresh = students.length > 0;
    if (isRefresh) setRefreshing(true);
    setError(null);
    getStudents()
      .then((res) => {
        const list = res.students || [];
        setStudents(list);
        setTotal(parseTotal(res, list));
        setError(null);
        setLastUpdated(new Date());
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
    let cancelled = false;
    getStudents()
      .then((res) => {
        if (cancelled) return;
        const list = res.students || [];
        setStudents(list);
        setTotal(parseTotal(res, list));
        setError(null);
        setLastUpdated(new Date());
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
    return () => { cancelled = true; };
  }, [addToast]);

  useEffect(() => {
    document.title = 'Dashboard – Student Advisor AI';
    return () => { document.title = 'Student Advisor AI'; };
  }, []);

  const counts = useMemo(
    () => ({
      high: students.filter((s) => String(s.risk_level || '').toUpperCase() === 'HIGH').length,
      medium: students.filter((s) => String(s.risk_level || '').toUpperCase() === 'MEDIUM').length,
      low: students.filter((s) => String(s.risk_level || '').toUpperCase() === 'LOW').length,
    }),
    [students]
  );

  const pieData = useMemo(
    () =>
      [
        { name: 'High Risk', value: counts.high, color: RISK_COLORS.HIGH },
        { name: 'Medium Risk', value: counts.medium, color: RISK_COLORS.MEDIUM },
        { name: 'Low Risk', value: counts.low, color: RISK_COLORS.LOW },
      ].filter((d) => d.value > 0),
    [counts]
  );

  const insights = useMemo(() => computeInsights(students), [students]);

  const hasData = students.length > 0;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-top">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Student result analysis and pass prediction</p>
          </div>
          <div className="dashboard-header-actions">
            {lastUpdated && (
              <span className="dashboard-last-updated">
                Updated {formatLastUpdated(lastUpdated)}
              </span>
            )}
            <button
              type="button"
              className="dashboard-refresh"
              onClick={fetchData}
              disabled={loading || refreshing}
              aria-label="Refresh data"
            >
              <span className="dashboard-refresh-icon">{refreshing ? '⟳' : '↻'}</span>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="dashboard-error dashboard-anim">
          <span className="dashboard-error-icon">⚠</span>
          <span>{error}</span>
          <button type="button" className="dashboard-retry" onClick={fetchData}>
            Retry
          </button>
        </div>
      )}

      <SummaryCards
        total={total}
        high={counts.high}
        medium={counts.medium}
        low={counts.low}
        animated={hasData}
      />

      {hasData && (
        <div className="dashboard-insights dashboard-anim dashboard-anim--2">
          <div className="dashboard-insight">
            <span className="dashboard-insight-value">{insights.avgPassPct}%</span>
            <span className="dashboard-insight-label">Avg. pass probability</span>
          </div>
          <div className="dashboard-insight">
            <span className="dashboard-insight-value dashboard-insight-value--risk">
              {insights.atRiskPct}%
            </span>
            <span className="dashboard-insight-label">Class at high risk</span>
          </div>
          {insights.topWeakTopic && (
            <div className="dashboard-insight">
              <span className="dashboard-insight-value dashboard-insight-value--topic">
                {insights.topWeakTopic}
              </span>
              <span className="dashboard-insight-label">Most common weak topic</span>
            </div>
          )}
        </div>
      )}

      <div className="dashboard-charts-row">
        <div className="dashboard-chart-card dashboard-anim dashboard-anim--3">
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
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color}
                      stroke="var(--bg-card)"
                      strokeWidth={2}
                    />
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
                <Legend formatter={(v) => v} wrapperStyle={{ fontSize: '0.85rem' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="dashboard-chart-empty">No risk data to display</p>
          )}
        </div>

        <div className="dashboard-chart-card dashboard-anim dashboard-anim--4">
          <h3 className="dashboard-chart-title">Pass probability distribution</h3>
          {loading ? (
            <div className="dashboard-chart-skeleton skeleton" />
          ) : hasData ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={insights.passBuckets} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="range"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                  formatter={(value) => [value, 'Students']}
                />
                <Bar
                  dataKey="count"
                  name="Students"
                  radius={[4, 4, 0, 0]}
                  animationDuration={600}
                  animationBegin={200}
                  fill={(entry) => entry?.fill ?? 'var(--accent-primary)'}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="dashboard-chart-empty">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
