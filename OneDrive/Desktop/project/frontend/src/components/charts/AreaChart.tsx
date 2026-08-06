import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AreaChartProps {
  data: any[]
  areas: Array<{
    dataKey: string
    stroke: string
    fill: string
    name: string
  }>
  height?: number
}

/**
 * Area Chart Component
 * Displays area chart with customizable data
 */
export default function AreaChart({ data, areas, height = 300 }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data}>
        <defs>
          {areas.map((area) => (
            <linearGradient id={area.dataKey} key={area.dataKey} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.fill} stopOpacity={0.3} />
              <stop offset="95%" stopColor={area.fill} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
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
        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            stroke={area.stroke}
            fill={`url(#${area.dataKey})`}
            name={area.name}
            strokeWidth={2}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}
