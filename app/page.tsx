"use client";

import { useMemo } from "react";
import { useFinance, fmt } from "@/lib/store";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

// Periode: tanggal 25 bulan lalu s/d 24 bulan ini
function getCurrentPeriod() {
  const now  = new Date();
  const day  = now.getDate();
  const m    = now.getMonth();
  const y    = now.getFullYear();

  let startM: number, startY: number, endM: number, endY: number;

  if (day >= 25) {
    // Sudah lewat tanggal 25: periode dimulai bulan ini tgl 25
    startY = y; startM = m;
    endY   = m === 11 ? y + 1 : y;
    endM   = m === 11 ? 0 : m + 1;
  } else {
    // Sebelum tanggal 25: periode dimulai bulan lalu tgl 25
    startY = m === 0 ? y - 1 : y;
    startM = m === 0 ? 11 : m - 1;
    endY   = y; endM = m;
  }

  const start = new Date(startY, startM, 25);
  const end   = new Date(endY,   endM,   24, 23, 59, 59);
  return { start, end };
}

// Periode N bulan ke belakang (untuk bar chart)
function getPeriodRange(offsetFromCurrent: number) {
  const now = new Date();
  const day = now.getDate();
  const m   = now.getMonth();
  const y   = now.getFullYear();

  // Tentukan "current period start month"
  let baseM = day >= 25 ? m : (m === 0 ? 11 : m - 1);
  let baseY = day >= 25 ? y : (m === 0 ? y - 1 : y);

  // Geser offset ke belakang
  let startM = baseM - offsetFromCurrent;
  let startY = baseY;
  while (startM < 0) { startM += 12; startY--; }

  let endM = startM + 1;
  let endY = startY;
  if (endM > 11) { endM = 0; endY++; }

  const start = new Date(startY, startM, 25);
  const end   = new Date(endY,   endM,   24, 23, 59, 59);
  const label = `${MONTHS[startM]} ${String(startY).slice(2)}–${MONTHS[endM]} ${String(endY).slice(2)}`;
  const shortLabel = `${MONTHS[startM]}`;
  return { start, end, label, shortLabel };
}

export default function Dashboard() {
  const { state } = useFinance();
  const { transactions, loading } = state;

  const { start: pStart, end: pEnd } = getCurrentPeriod();

  // Ringkasan periode saat ini
  const { inc, exp } = useMemo(() => {
    const tx = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= pStart && d <= pEnd;
    });
    return {
      inc: tx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
      exp: tx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  }, [transactions, pStart, pEnd]);

  // Bar chart 6 periode terakhir
  const barData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const { start, end, shortLabel } = getPeriodRange(5 - i);
      const tx = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
      return {
        name: shortLabel,
        Pemasukan:   tx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        Pengeluaran: tx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions]);

  const donutData = [
    { name: "Pemasukan",   value: inc },
    { name: "Pengeluaran", value: exp },
  ];
  const COLORS = ["#10b981", "#f43f5e"];
  const fmtM   = (v: number) => `${(v / 1e6).toFixed(1)}jt`;
  const total  = inc + exp || 1;

  const periodLabel = `${pStart.getDate()} ${MONTHS[pStart.getMonth()]} – ${pEnd.getDate()} ${MONTHS[pEnd.getMonth()]} ${pEnd.getFullYear()}`;

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Memuat data...
    </div>
  );

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
      <p className="text-sm text-gray-400 mb-6">Periode {periodLabel}</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">Total Saldo</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{fmt(inc - exp)}</p>
          <p className="text-xs text-gray-400 mt-1">Pemasukan − Pengeluaran</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">Pemasukan</span>
          </div>
          <p className="text-2xl font-semibold text-emerald-500">{fmt(inc)}</p>
          <p className="text-xs text-gray-400 mt-1">Periode ini</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={16} className="text-rose-500" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">Pengeluaran</span>
          </div>
          <p className="text-2xl font-semibold text-rose-500">{fmt(exp)}</p>
          <p className="text-xs text-gray-400 mt-1">Periode ini</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card md:col-span-2">
          <p className="text-sm font-medium text-gray-700 mb-4">Komposisi periode ini</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={donutData} cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                dataKey="value" paddingAngle={3}
              >
                {donutData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: unknown) => fmt(v as number)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              Pemasukan {Math.round(inc / total * 100)}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
              Pengeluaran {Math.round(exp / total * 100)}%
            </span>
          </div>
        </div>

        <div className="card md:col-span-3">
          <p className="text-sm font-medium text-gray-700 mb-4">Tren 6 periode terakhir</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={10} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={fmtM} />
              <Tooltip formatter={(v: unknown) => fmt(v as number)} />
              <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Pemasukan"   fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}