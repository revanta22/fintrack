"use client";

import { useMemo } from "react";
import { useFinance, fmt } from "@/lib/store";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

export default function Dashboard() {
  const { state: { transactions } } = useFinance();

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear  = now.getFullYear();

  const { inc, exp } = useMemo(() => {
    const tx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
    });
    return {
      inc: tx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
      exp: tx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  }, [transactions, thisMonth, thisYear]);

  const barData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const offset = 5 - i;
      const m  = ((thisMonth - offset) % 12 + 12) % 12;
      const yr = thisMonth - offset < 0 ? thisYear - 1 : thisYear;
      const tx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === yr && d.getMonth() === m;
      });
      return {
        name: MONTHS[m],
        Pemasukan:   tx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        Pengeluaran: tx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions, thisMonth, thisYear]);

  const donutData = [
    { name: "Pemasukan",   value: inc },
    { name: "Pengeluaran", value: exp },
  ];
  const COLORS = ["#10b981", "#f43f5e"];
  const fmtM   = (v: number) => `${(v / 1e6).toFixed(1)}jt`;
  const total  = inc + exp || 1;

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
      <p className="text-sm text-gray-400 mb-6">
        Ringkasan {MONTHS[thisMonth]} {thisYear}
      </p>

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
          <p className="text-xs text-gray-400 mt-1">Bulan ini</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={16} className="text-rose-500" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">Pengeluaran</span>
          </div>
          <p className="text-2xl font-semibold text-rose-500">{fmt(exp)}</p>
          <p className="text-xs text-gray-400 mt-1">Bulan ini</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Donut */}
        <div className="card md:col-span-2">
          <p className="text-sm font-medium text-gray-700 mb-4">Komposisi bulan ini</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%" cy="50%"
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

        {/* Bar */}
        <div className="card md:col-span-3">
          <p className="text-sm font-medium text-gray-700 mb-4">Tren 6 bulan terakhir</p>
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