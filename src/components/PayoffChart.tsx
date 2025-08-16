"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  month: number;
  traditionalBalance: number;
  helocBalance: number;
  traditionalInterest: number;
  helocInterest: number;
}

interface PayoffChartProps {
  data: ChartData[];
  title?: string;
}

export default function PayoffChart({
  data,
  title = "Mortgage Payoff Comparison",
}: PayoffChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTooltip = (value: number, name: string) => {
    return [formatCurrency(value), name];
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              label={{ value: "Months", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              label={{
                value: "Balance ($)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={(label) => `Month ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="traditionalBalance"
              stroke="#6B7280"
              strokeWidth={2}
              name="Traditional Mortgage"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="helocBalance"
              stroke="#3B82F6"
              strokeWidth={2}
              name="HELOC Strategy"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
