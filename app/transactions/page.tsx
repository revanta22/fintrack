"use client";

import { useState, useMemo } from "react";
import { useFinance, fmt } from "@/lib/store";
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/types";
import Modal from "@/components/Modal";
import { Plus, Pencil, Trash2 } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

const blank = (): Omit<Transaction, "id"> => ({
  type: "income",
  amount: 0,
  category: INCOME_CATEGORIES[0],
  description: "",
  date: new Date().toISOString().split("T")[0],
});

export default function TransactionsPage() {
  const { state: { transactions, loading }, addTx, updateTx, deleteTx } = useFinance();
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState<Omit<Transaction, "id">>(blank());
  const [editId, setEditId]   = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [filterType, setFilterType]   = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const months = useMemo(() => {
    const set = new Set(transactions.map(t => t.date.slice(0, 7)));
    return [...set].sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    return [...transactions]
      .filter(t => filterType === "all" || t.type === filterType)
      .filter(t => filterMonth === "all" || t.date.startsWith(filterMonth))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, filterType, filterMonth]);

  const cats = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function openNew() {
    setEditId(null);
    setForm(blank());
    setOpen(true);
  }

  function openEdit(t: Transaction) {
    setEditId(t.id);
    setForm({ type: t.type, amount: t.amount, category: t.category, description: t.description, date: t.date });
    setOpen(true);
  }

  async function save() {
    if (!form.description || !form.amount || !form.date) return;
    setSaving(true);
    if (editId) {
      await updateTx({ id: editId, ...form });
    } else {
      await addTx(form);
    }
    setSaving(false);
    setOpen(false);
  }

  async function del(id: string) {
    if (confirm("Hapus transaksi ini?")) await deleteTx(id);
  }

  function setType(t: "income" | "expense") {
    setForm(f => ({ ...f, type: t, category: t === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0] }));
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Memuat data...
    </div>
  );

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Transaksi</h1>
      <p className="text-sm text-gray-400 mb-6">Kelola pemasukan & pengeluaran kamu</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <select className="form-input w-auto" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">Semua Tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
        <select className="form-input w-auto" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="all">Semua Bulan</option>
          {months.map(m => (
            <option key={m} value={m}>
              {MONTHS[parseInt(m.slice(5, 7)) - 1]} {m.slice(0, 4)}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={14} /> Tambah Transaksi
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Tanggal","Deskripsi","Kategori","Tipe","Jumlah",""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Belum ada transaksi</td></tr>
            ) : filtered.map(t => (
              <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-gray-400">{t.date}</td>
                <td className="px-4 py-3 text-gray-700">{t.description}</td>
                <td className="px-4 py-3 text-gray-500">{t.category}</td>
                <td className="px-4 py-3">
                  <span className={t.type === "income" ? "badge-income" : "badge-expense"}>
                    {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
                  </span>
                </td>
                <td className={`px-4 py-3 font-medium ${t.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>
                  {t.type === "income" ? "+" : "−"}{fmt(t.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <button className="btn p-1.5" onClick={() => openEdit(t)}><Pencil size={13} /></button>
                    <button className="btn btn-danger p-1.5" onClick={() => del(t.id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit Transaksi" : "Tambah Transaksi"}>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-4">
          {(["income", "expense"] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-1 py-2 text-sm font-medium transition-colors
                ${form.type === t
                  ? t === "income" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
                  : "text-gray-500 hover:bg-gray-50"}`}>
              {t === "income" ? "Pemasukan" : "Pengeluaran"}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <div>
            <label className="form-label">Deskripsi</label>
            <input className="form-input" placeholder="cth. Gaji Maret"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Jumlah (Rp)</label>
            <input className="form-input" type="number" placeholder="0"
              value={form.amount || ""}
              onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="form-label">Kategori</label>
            <select className="form-input" value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Tanggal</label>
            <input className="form-input" type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn" onClick={() => setOpen(false)}>Batal</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </Modal>
    </div>
  );
}