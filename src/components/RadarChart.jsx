import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

export default function RadarChart({ topicScores = {} }) {
  // List of columns to exclude (not subjects) - check with lowercase and underscore variations
  const excludePatterns = [
    'attendance', 'internal', 'assignment', 'gpa', 'midterm', 'quiz', 
    'participation', 'study', 'absence', 'pass', 'student', 'id', 
    'record', 'probability', 'risk', 'prediction', 'weak', 'marks', 
    'score', 'name', 'email', 'phone', 'address', 'age', 'gender'
  ];
  
  // Dynamically get topics from the topicScores object, excluding metadata
  const topics = Object.keys(topicScores).filter(key => {
    const lowerKey = key.toLowerCase().replace(/[_\s]/g, '');
    // Check if the key contains any of the exclude patterns
    return !excludePatterns.some(pattern => lowerKey.includes(pattern));
  });
  
  // If no topics, show a message
  if (topics.length === 0) {
    return (
      <div className="radar-chart-wrap" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 320,
        color: 'var(--text-secondary)',
        fontSize: '0.95rem'
      }}>
        No topic scores available
      </div>
    );
  }

  const data = topics.map((topic) => ({
    topic,
    score: Number(topicScores[topic]) ?? 0,
    fullMark: 100,
  }));

  return (
    <div className="radar-chart-wrap">
      <ResponsiveContainer width="100%" height={320}>
        <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--border-subtle)" />
          <PolarAngleAxis
            dataKey="topic"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="var(--accent-primary)"
            fill="var(--accent-primary)"
            fillOpacity={0.35}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
            }}
            formatter={(value) => [`${value}`, 'Score']}
          />
          <Legend
            wrapperStyle={{ fontSize: '0.85rem' }}
            formatter={() => 'Topic Score'}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
