import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface BarChartProps {
  data: any[]
  bars: Array<{
    dataKey: string
    fill: string
    name: string
  }>
  height?: number
}

/**
 * Bar Chart Component
 * Displays bar chart with customizable data
 */
export default function BarChart({ data, bars, height = 300 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis stroke="var(--chart-text)" />
        <YAxis stroke="var(--chart-text)" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--chart-bg)',
            border: 'var(--chart-border)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'var(--chart-text)' }}
        />
        <Legend />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.fill}
            name={bar.name}
            radius={[8, 8, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
