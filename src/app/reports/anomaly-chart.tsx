
'use client';

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type AnomalyChartProps = {
  data: { name: string; count: number }[];
};

export function AnomalyChart({ data }: AnomalyChartProps) {
  return (
    <div className="h-60 w-full">
        <ChartContainer config={{}} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <XAxis type="number" hide />
            <YAxis 
                dataKey="name" 
                type="category" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 12 }} 
                width={80}
            />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent 
                formatter={(value, name) => (
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">{name}</span>
                        <span className="text-xs">{`${value} ${value === 1 ? 'anomaly' : 'anomalies'} detected`}</span>
                    </div>
                )}
                labelFormatter={() => ''}
              />}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
          </BarChart>
        </ResponsiveContainer>
        </ChartContainer>
    </div>
  );
}
