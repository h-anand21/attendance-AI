
'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Sector } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
} from '@/components/ui/chart';

type AttendancePieChartProps = {
  data: { name: string; value: number }[];
};

const chartConfig = {
  Present: {
    label: 'Present',
    color: 'hsl(var(--chart-2))',
  },
  Absent: {
    label: 'Absent',
    color: 'hsl(var(--chart-5))',
  },
  Late: {
    label: 'Late',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

const COLORS = {
  Present: 'hsl(var(--chart-2))',
  Absent: 'hsl(var(--chart-5))',
  Late: 'hsl(var(--chart-4))',
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 1.25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="hsl(var(--muted-foreground))" fill="none" />
      <circle cx={sx} cy={sy} r={2} fill="hsl(var(--muted-foreground))" stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" dominantBaseline="central">
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};


export function AttendancePieChart({ data }: AttendancePieChartProps) {
  const totalStudents = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Overall Status</CardTitle>
        <CardDescription>
          Summary for the selected date range. Total records: {totalStudents}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {totalStudents > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 50, bottom: 20, left: 50 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || 'hsl(var(--muted))'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No attendance data for this range.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}