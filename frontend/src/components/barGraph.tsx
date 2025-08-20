import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

type SevItem = {
  date: string;         // dd/mm/yyyy หรือ yyyy-mm-dd ก็ได้
  Critical: number;
  High: number;
  Medium: number;
  Low: number;
};

interface BarGraphProps {
  data: SevItem[];
  height?: number;
  colors?: Partial<Record<keyof Omit<SevItem, "date">, string>>;
setSelectBarDate?: (date: string | null) => void;
}

const defaultColors = {
    Critical: "#fd6a70", // lighten #fb2830 by ~20%
    High: "#ffa366",     // lighten #ff7200 by ~20%
    Medium: "#f9d76b",   // lighten #f4b600 by ~20%
    Low: "#4be88a",      // lighten #00c947 by ~20%
};

const formatDateLabel = (s: string) => {
  // แสดงสั้นๆ dd/mm
  if (s.includes("/")) {
    const [dd, mm, yyyy] = s.split("/");
    return `${dd}/${mm}/${yyyy ? yyyy.slice(-2) : ""}`;
  }
  // ถ้าเป็น ISO
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((acc: number, p: any) => acc + (p.value ?? 0), 0);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow">
      <div className="mb-1 text-xs text-gray-500">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{ background: p.color }}
          />
          <span className="w-16">{p.dataKey}</span>
          <span className="font-medium">{p.value}</span>
        </div>
      ))}
      <div className="mt-2 border-t pt-1 text-sm">
        <span className="text-gray-600">Total:</span>{" "}
        <span className="font-semibold">{total}</span>
      </div>
    </div>
  );
};

function BarGraph({
  data,
  height = 320,
  colors = defaultColors,
  setSelectBarDate,
}: BarGraphProps) {
  // เติม total ไว้เผื่อใช้งานต่อ (ถ้าจะโชว์บนแกน Y max ฯลฯ)
  const withTotal = useMemo(
    () =>
      (data ?? []).map((d) => ({
        ...d,
        total: (d.Critical || 0) + (d.High || 0) + (d.Medium || 0) + (d.Low || 0),
      })),
    [data]
  );

  return (
    <div className="h-64 w-full border border-primary2 rounded-xl bg-gray-50 p-4 outline-none chart-wrap">
      <div className="mb-2 text-sm text-gray-600">Ticket</div>
      <div style={{ width: "100%", height: "94%" }} className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%" className="focus:outline-none outline-none select-none ">
          <BarChart data={withTotal}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fontSize: 12 }}
              stroke="#374151"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#374151" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }}/>

            {/* 1 แท่ง = 1 วัน; แบ่งสีตามระดับความรุนแรง (stackId เดียวกัน) */}
            <Bar dataKey="Critical" stackId="sev" fill={colors.Critical ?? defaultColors.Critical} 
            onClick={(data, index) => {
                setSelectBarDate?.(data?.payload?.date);
            }}/>
            <Bar dataKey="High"     stackId="sev" fill={colors.High ?? defaultColors.High} 
            onClick={(data, index) => {
                setSelectBarDate?.(data?.payload?.date);
            }}/>
            <Bar dataKey="Medium"   stackId="sev" fill={colors.Medium ?? defaultColors.Medium} 
            onClick={(data, index) => {
                setSelectBarDate?.(data?.payload?.date);
            }}/>
            <Bar dataKey="Low"      stackId="sev" fill={colors.Low ?? defaultColors.Low}  radius={[6, 6, 0, 0]}
            onClick={(data, index) => {
                setSelectBarDate?.(data?.payload?.date);
            }}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default BarGraph;
