
'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
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
  ChartTooltipContent,
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
              <PieChart>
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={70}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

                    if (percent * 100 < 5) return null; // Don't render label for small slices

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-xs font-bold"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name as keyof typeof COLORS] || 'hsl(var(--muted))'}
                      className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  ))}
                </Pie>
                <Legend
                  content={({ payload }) => {
                    return (
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 text-sm">
                        {payload?.map((entry, index) => (
                          <div
                            key={`item-${index}`}
                            className="flex items-center gap-1.5"
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            ></span>
                            <span className="text-muted-foreground">{entry.value}:</span>
                            <span className="font-medium">
                                {data.find(d => d.name === entry.value)?.value || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
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

    