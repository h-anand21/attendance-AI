
'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useTheme } from 'next-themes';

type AttendanceBarChartProps = {
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

export function AttendanceBarChart({ data }: AttendanceBarChartProps) {
  const { theme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Trends</CardTitle>
        <CardDescription>
          Attendance summary for each day in the selected range.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                 <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-present)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-present)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-absent)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-absent)" stopOpacity={0}/>
                    </linearGradient>
                     <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-late)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-late)" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} 
                />
                <YAxis 
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
                <Area type="monotone" dataKey="present" stroke="var(--color-present)" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" />
                <Area type="monotone" dataKey="absent" stroke="var(--color-absent)" strokeWidth={2} fillOpacity={1} fill="url(#colorAbsent)" />
                <Area type="monotone" dataKey="late" stroke="var(--color-late)" strokeWidth={2} fillOpacity={1} fill="url(#colorLate)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex h-[350px] items-center justify-center">
            <p className="text-muted-foreground">No attendance data for this range.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
