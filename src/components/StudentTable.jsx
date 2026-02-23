import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import RiskBadge from './RiskBadge';
import './StudentTable.css';

function PassProbabilityBar({ value }) {
  const pct = Math.round(Number(value) * 100) || 0;
  let variant = 'low';
  if (pct < 40) variant = 'high';
  else if (pct < 65) variant = 'medium';

  return (
    <div className="pass-prob-wrap">
      <div className="pass-prob-bar">
        <div
          className={`pass-prob-fill pass-prob-fill--${variant}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className="pass-prob-text">{pct}%</span>
    </div>
  );
}

export default function StudentTable({ students = [], loading }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 280);
  const [sortKey, setSortKey] = useState('student_id');
  const [sortDir, setSortDir] = useState('asc');

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return students;
    const s = debouncedSearch.toLowerCase();
    return students.filter(
      (st) =>
        String(st.student_id || '').toLowerCase().includes(s) ||
        (st.weak_topics || []).some((t) => String(t).toLowerCase().includes(s))
    );
  }, [students, debouncedSearch]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (sortKey === 'pass_probability' || sortKey === 'previous_gpa') {
        va = Number(va) ?? 0;
        vb = Number(vb) ?? 0;
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const isEmpty = !loading && students.length === 0;
  const noResults = !loading && students.length > 0 && sorted.length === 0;

  if (loading) {
    return (
      <div className="student-table-card">
        <div className="student-table-toolbar">
          <input
            type="search"
            placeholder="Search by ID or topic..."
            disabled
            className="student-table-search"
          />
        </div>
        <div className="student-table-skeleton">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />
          ))}
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="student-table-card">
        <div className="student-table-empty">
          <p className="student-table-empty-title">No students loaded</p>
          <p className="student-table-empty-desc">Use Refresh to load data from the server.</p>
        </div>
      </div>
    );
  }

  const headers = [
    { key: 'student_id', label: 'ID' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'internal_marks', label: 'Internal' },
    { key: 'assignment_marks', label: 'Assignment' },
    { key: 'previous_gpa', label: 'GPA' },
    { key: 'pass_probability', label: 'Pass %' },
    { key: 'risk_level', label: 'Risk' },
    { key: 'weak_topics', label: 'Weak Topics' },
  ];

  return (
    <div className="student-table-card">
      <div className="student-table-toolbar">
        <input
          type="search"
          placeholder="Search by ID or topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="student-table-search"
          aria-label="Search students"
        />
      </div>
      {noResults ? (
        <div className="student-table-empty student-table-empty--filtered">
          <p className="student-table-empty-title">No matching students</p>
          <p className="student-table-empty-desc">Try a different search or clear filters.</p>
        </div>
      ) : (
        <div className="student-table-scroll">
          <table className="student-table">
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h.key}>
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort(h.key)}
                    >
                      {h.label}
                      <span className="sort-icon">
                        {sortKey === h.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((student) => (
                <tr
                  key={student.student_id}
                  onClick={() => navigate(`/student/${student.student_id}`)}
                  className="student-row"
                >
                  <td>{student.student_id}</td>
                  <td>{student.attendance ?? '-'}</td>
                  <td>{student.internal_marks ?? '-'}</td>
                  <td>{student.assignment_marks ?? '-'}</td>
                  <td>{student.previous_gpa ?? '-'}</td>
                  <td>
                    <PassProbabilityBar value={student.pass_probability} />
                  </td>
                  <td>
                    <RiskBadge level={student.risk_level} />
                  </td>
                  <td>
                    <div className="weak-topics">
                      {(student.weak_topics || []).map((t) => (
                        <span key={t} className="weak-topic-chip">{t}</span>
                      ))}
                      {(student.weak_topics || []).length === 0 && (
                        <span className="weak-topic-none">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
