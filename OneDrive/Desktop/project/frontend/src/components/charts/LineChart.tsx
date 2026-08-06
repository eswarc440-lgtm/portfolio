import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface LineChartProps {
  data: any[]
  lines: Array<{
    dataKey: string
    stroke: string
    name: string
  }>
  height?: number
}

/**
 * Line Chart Component
 * Displays line chart with customizable data
 */
export default function LineChart({ data, lines, height = 300 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
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
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            name={line.name}
            strokeWidth={2}
            dot={{ fill: line.stroke, r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
