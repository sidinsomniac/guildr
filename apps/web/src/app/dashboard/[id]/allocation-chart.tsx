"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#94a3b8"];

export function AllocationChart({
  allocation,
}: {
  allocation: Record<string, number>;
}) {
  const data = [
    { name: "Equity", value: Number(allocation.EQUITY.toFixed(1)) },
    { name: "Debt", value: Number(allocation.DEBT.toFixed(1)) },
    { name: "Cash", value: Number(allocation.CASH.toFixed(1)) },
  ].filter((item) => item.value > 0);

  console.log("AllocationChart - allocation:", allocation);
  console.log("AllocationChart - mapped data:", data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value}%`, "Allocation"]}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}
