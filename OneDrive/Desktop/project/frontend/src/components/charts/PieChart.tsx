import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface PieChartProps {
  data: Array<{
    name: string
    value: number
  }>
  colors: string[]
  height?: number
}

/**
 * Pie Chart Component
 * Displays pie/donut chart with customizable data
 */
export default function PieChart({ data, colors, height = 300 }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--chart-bg)',
            border: 'var(--chart-border)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'var(--chart-text)' }}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
