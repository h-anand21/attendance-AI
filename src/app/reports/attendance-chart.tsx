
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

type AttendanceChartProps = {
  data: { date: string; present: number; absent: number; late: number }[];
};

const chartConfig = {
  present: {
    label: 'Present',
    color: 'hsl(var(--chart-2))',
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

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Attendance Overview</CardTitle>
        <CardDescription>
          A summary of attendance status for each day in the selected month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric' })} 
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip 
                cursor={false}
                content={<ChartTooltipContent 
                    labelFormatter={(label, payload) => {
                        return new Date(payload?.[0]?.payload.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    }}
                />} 
              />
              <Legend />
              <Bar dataKey="present" fill="var(--color-present)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="var(--color-absent)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late" fill="var(--color-late)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
