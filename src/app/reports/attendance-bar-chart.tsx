
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip, Line } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

type AttendanceBarChartProps = {
  data: { date: string; present: number; absent: number; late: number }[];
};

const chartConfig = {
  present: {
    label: 'Present',
    color: 'hsl(var(--chart-1))',
  },
  absent: {
    label: 'Absent',
    color: 'hsl(var(--chart-5))',
  },
  late: {
    label: 'Late',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export function AttendanceBarChart({ data }: AttendanceBarChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Daily Trends</CardTitle>
        <CardDescription>
          Attendance summary for each day in the selected range.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} 
                />
                <YAxis 
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  allowDecimals={false}
                  tickFormatter={(value) => `${value}`}
                />
                 <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  allowDecimals={false}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip 
                  cursor={{fill: 'hsl(var(--muted))'}}
                  content={<ChartTooltipContent 
                      labelFormatter={(label, payload) => {
                          const date = payload?.[0]?.payload.date;
                          if (!date) return label;
                          return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                      }}
                  />} 
                />
                <Legend />
                <Bar dataKey="present" yAxisId="left" fill="var(--color-present)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" yAxisId="right" dataKey="absent" stroke="var(--color-absent)" strokeWidth={2} dot={false} />
                <Line type="monotone" yAxisId="right" dataKey="late" stroke="var(--color-late)" strokeWidth={2} dot={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No attendance data for this range.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
