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

const TOPIC_KEYS = ['Recursion', 'Sorting', 'Trees', 'Graphs', 'Dp'];

export default function RadarChart({ topicScores = {} }) {
  const data = TOPIC_KEYS.map((topic) => ({
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
