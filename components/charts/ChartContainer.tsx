"use client";

import { ResponsiveContainer } from "recharts";

export function ChartContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
