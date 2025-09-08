
'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';
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
  title: string;
  description: string;
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

export function AttendancePieChart({ data, title, description }: AttendancePieChartProps) {
  const totalStudents = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description} Total records: {totalStudents}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {totalStudents > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || 'hsl(var(--muted))'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex h-full min-h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No attendance data for this range.</p>
          </div>
        )}
      </CardContent>
       <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 p-4 text-sm">
          {Object.entries(chartConfig).map(([key, config]) => {
              const entry = data.find(d => d.name === key);
              if (!entry) return null;
              return (
                  <div key={key} className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{backgroundColor: config.color}} />
                      <span>{config.label} ({entry.value})</span>
                  </div>
              )
          })}
      </div>
    </Card>
  );
}
