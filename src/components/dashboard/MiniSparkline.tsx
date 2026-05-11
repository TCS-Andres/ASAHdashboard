import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import type { DailyPoint } from '@/lib/data';

interface Props {
  points: DailyPoint[];
  /** Stroke color override. Defaults to the primary brand color. */
  color?: string;
  height?: number;
}

const MiniSparkline = ({ points, color = 'hsl(var(--primary))', height = 36 }: Props) => {
  if (points.length === 0) return <div style={{ height }} aria-hidden />;
  return (
    <div style={{ height }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniSparkline;
