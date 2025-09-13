
"use client"

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RequestResult } from '@/app/actions';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ResultsChartProps {
  results: RequestResult[];
}

const chartConfig = {
  count: {
    label: "Count",
  },
  success: {
    label: "Success (2xx)",
    color: "hsl(var(--chart-2))",
  },
  clientError: {
    label: "Client Error (4xx)",
    color: "hsl(var(--chart-4))",
  },
  serverError: {
    label: "Server Error (5xx)",
    color: "hsl(var(--chart-5))",
  },
  other: {
    label: "Other/Network Error",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig

export function ResultsChart({ results }: ResultsChartProps) {
  const chartData = useMemo(() => {
    if (!results || results.length === 0) return [];

    const summary = {
      success: 0,
      clientError: 0,
      serverError: 0,
      other: 0,
    };

    results.forEach(result => {
      if (result.status >= 200 && result.status < 300) {
        summary.success++;
      } else if (result.status >= 400 && result.status < 500) {
        summary.clientError++;
      } else if (result.status >= 500) {
        summary.serverError++;
      } else {
        summary.other++;
      }
    });

    return [
      {
        status: "Success (2xx)",
        success: summary.success,
      },
      {
        status: "Client Error (4xx)",
        clientError: summary.clientError,
      },
      {
        status: "Server Error (5xx)",
        serverError: summary.serverError,
      },
      {
        status: "Other",
        other: summary.other,
      },
    ];
  }, [results]);

  if (results.length === 0) {
    return null;
  }
  
  const totalRequests = results.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results Summary</CardTitle>
        <CardDescription>
          A visual summary of the {totalRequests} requests sent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-64 w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 10,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="status"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
              className="text-xs"
            />
            <XAxis dataKey="success" type="number" hide />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              content={<ChartTooltipContent 
                indicator="dot"
                labelKey="status"
              />}
            />
            <Legend content={() => null} />
            <Bar dataKey="success" stackId="a" fill="var(--color-success)" radius={4} />
            <Bar dataKey="clientError" stackId="a" fill="var(--color-clientError)" radius={4} />
            <Bar dataKey="serverError" stackId="a" fill="var(--color-serverError)" radius={4} />
            <Bar dataKey="other" stackId="a" fill="var(--color-other)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
