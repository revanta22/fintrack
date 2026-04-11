"use client";

import { useState, useMemo } from "react";
import { useFinance, fmt } from "@/lib/store";
import { Asset, ASSET_CATEGORIES } from "@/lib/types";
import Modal from "@/components/Modal";
import { Plus, Pencil, Trash2, Landmark } from "lucide-react";

const blank = (): Omit<Asset, "id"> => ({
  name: "", value: 0, category: ASSET_CATEGORIES[0], notes: "",
});

export default function AssetsPage() {
  const { state: { assets }, dispatch } = useFinance();
  const [open, setOpen]     = useState(false);
  const [form, setForm]     = useState<Omit<Asset, "id">>(blank());
  const [editId, setEditId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState("all");

  const filtered = useMemo(() =>
    filterCat === "all" ? assets : assets.filter(a => a.category === filterCat),
  [assets, filterCat]);

  const total = assets.reduce((s, a) => s + a.value, 0);

  function openNew() { setEditId(null); setForm(blank()); setOpen(true); }
  function openEdit(a: Asset) {
    setEditId(a.id);
    setForm({ name: a.name, value: a.value, category: a.category, notes: a.notes ?? "" });
    setOpen(true);
  }
  function save() {
    if (!form.name || !form.value) return;
    if (editId) {
      dispatch({ type: "UPDATE_ASSET", payload: { id: editId, ...form } });
    } else {
      dispatch({ type: "ADD_ASSET", payload: { id: "a" + Date.now(), ...form } });
    }
    setOpen(false);
  }
  function del(id: string) {
    if (confirm("Hapus aset ini?")) dispatch({ type: "DELETE_ASSET", payload: id });
  }

  // Category color map
  const catColor: Record<string, string> = {
    "Rekening Bank": "bg-blue-50 text-blue-700",
    "Investasi":     "bg-violet-50 text-violet-700",
    "Properti":      "bg-amber-50 text-amber-700",
    "Kendaraan":     "bg-orange-50 text-orange-700",
    "Kripto":        "bg-sky-50 text-sky-700",
    "Emas":          "bg-yellow-50 text-yellow-700",
    "Lainnya":       "bg-gray-100 text-gray-500",
  };

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Manajemen Aset</h1>
      <p className="text-sm text-gray-400 mb-6">Pantau dan kelola semua aset kamu</p>

      {/* Total */}
      <div className="card mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Landmark size={18} className="text-gray-400" />
          <span className="text-sm text-gray-500">Total Nilai Aset</span>
        </div>
        <span className="text-xl font-semibold text-gray-900">{fmt(total)}</span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select className="form-input w-auto" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">Semua Kategori</option>
          {ASSET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="flex-1" />
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={14} /> Tambah Aset
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Belum ada aset. Tambah aset baru!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => (
            <div key={a.id} className="card flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.name}</p>
                  {a.notes && <p className="text-xs text-gray-400 mt-0.5">{a.notes}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${catColor[a.category] ?? catColor["Lainnya"]}`}>
                  {a.category}
                </span>
              </div>
              <p className="text-xl font-semibold text-gray-900">{fmt(a.value)}</p>
              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                <button className="btn text-xs py-1 px-3" onClick={() => openEdit(a)}>
                  <Pencil size={12} /> Edit
                </button>
                <button className="btn btn-danger text-xs py-1 px-3" onClick={() => del(a.id)}>
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit Aset" : "Tambah Aset"}>
        <div className="space-y-3">
          <div>
            <label className="form-label">Nama Aset</label>
            <input className="form-input" placeholder="cth. Tabungan BCA"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Nilai (Rp)</label>
            <input className="form-input" type="number" placeholder="0"
              value={form.value || ""}
              onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="form-label">Kategori</label>
            <select className="form-input" value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {ASSET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Catatan (opsional)</label>
            <input className="form-input" placeholder="Info tambahan"
              value={form.notes ?? ""}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn" onClick={() => setOpen(false)}>Batal</button>
          <button className="btn btn-primary" onClick={save}>Simpan</button>
        </div>
      </Modal>
    </div>
  );
}
