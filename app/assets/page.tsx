"use client";

import { useState, useMemo, useEffect } from "react";
import { useFinance, fmt } from "@/lib/store";
import { Asset, ASSET_CATEGORIES } from "@/lib/types";
import Modal from "@/components/Modal";
import { Plus, Pencil, Trash2, Landmark, RefreshCw, Loader2 } from "lucide-react";
import type { GoldData, GoldEntry } from "@/app/api/gold-price/route";

const blank = (): Omit<Asset, "id"> => ({
  name: "", value: 0, category: ASSET_CATEGORIES[0], notes: "",
});

export default function AssetsPage() {
  const { state: { assets, loading }, addAsset, updateAsset, deleteAsset } = useFinance();
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState<Omit<Asset, "id">>(blank());
  const [editId, setEditId]   = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  const [goldData, setGoldData]         = useState<GoldData | null>(null);
  const [goldLoading, setGoldLoading]   = useState(false);
  const [goldUpdatedAt, setGoldUpdatedAt] = useState<string>("");
  const [goldSource, setGoldSource]     = useState<string>("");
  const [isGold, setIsGold]             = useState(false);
  const [goldVendor, setGoldVendor]     = useState("");
  const [goldWeight, setGoldWeight]     = useState<number | "">("");
  const [goldPriceInfo, setGoldPriceInfo] = useState<GoldEntry | null>(null);

  const fetchGoldPrice = async () => {
    setGoldLoading(true);
    try {
      const res  = await fetch("/api/gold-price");
      const json = await res.json();
      setGoldData(json.data);
      setGoldSource(json.source);
      setGoldUpdatedAt(json.updatedAt);
    } catch {
      console.error("Gagal fetch harga emas");
    } finally {
      setGoldLoading(false);
    }
  };

  useEffect(() => { fetchGoldPrice(); }, []);

  useEffect(() => {
    if (!goldData || !goldVendor || !goldWeight) { setGoldPriceInfo(null); return; }
    const entries = goldData[goldVendor];
    if (!entries) { setGoldPriceInfo(null); return; }
    const exact = entries.find(e => e.weight === goldWeight);
    if (exact) {
      setGoldPriceInfo(exact);
      setForm(f => ({ ...f, value: exact.sellPrice }));
    } else {
      const perGram = entries.find(e => e.weight === 1);
      if (perGram) {
        const estimated = Math.round(perGram.sellPrice * (goldWeight as number));
        setGoldPriceInfo({ weight: goldWeight as number, buyPrice: estimated, sellPrice: 0 });
        setForm(f => ({ ...f, value: estimated }));
      }
    }
  }, [goldVendor, goldWeight, goldData]);

  const filtered = useMemo(() =>
    filterCat === "all" ? assets : assets.filter(a => a.category === filterCat),
  [assets, filterCat]);

  const total     = assets.reduce((s, a) => s + a.value, 0);
  const goldTotal = assets.filter(a => a.category === "Emas").reduce((s, a) => s + a.value, 0);

  function openNew() {
    setEditId(null); setForm(blank()); setIsGold(false);
    setGoldVendor(""); setGoldWeight(""); setGoldPriceInfo(null);
    setOpen(true);
  }

  function openEdit(a: Asset) {
    setEditId(a.id);
    setForm({ name: a.name, value: a.value, category: a.category, notes: a.notes ?? "" });
    setIsGold(a.category === "Emas");
    setGoldVendor(""); setGoldWeight(""); setGoldPriceInfo(null);
    setOpen(true);
  }

  async function save() {
    if (!form.name || !form.value) return;
    setSaving(true);
    if (editId) {
      await updateAsset({ id: editId, ...form });
    } else {
      await addAsset(form);
    }
    setSaving(false);
    setOpen(false);
  }

  async function del(id: string) {
    if (confirm("Hapus aset ini?")) await deleteAsset(id);
  }

  const catColor: Record<string, string> = {
    "Rekening Bank": "bg-blue-50 text-blue-700",
    "Investasi":     "bg-violet-50 text-violet-700",
    "Properti":      "bg-amber-50 text-amber-700",
    "Kendaraan":     "bg-orange-50 text-orange-700",
    "Kripto":        "bg-sky-50 text-sky-700",
    "Emas":          "bg-yellow-50 text-yellow-700",
    "Lainnya":       "bg-gray-100 text-gray-500",
  };

  const vendors = goldData ? Object.keys(goldData) : [];
  const weights = goldData && goldVendor ? goldData[goldVendor]?.map(e => e.weight) ?? [] : [];

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Memuat data...
    </div>
  );

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Manajemen Aset</h1>
      <p className="text-sm text-gray-400 mb-6">Pantau dan kelola semua aset kamu</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Landmark size={18} className="text-gray-400" />
            <span className="text-sm text-gray-500">Total Nilai Aset</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">{fmt(total)}</span>
        </div>
        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">✨</span>
            <div>
              <span className="text-sm text-gray-500">Total Aset Emas</span>
              {goldUpdatedAt && (
                <p className="text-xs text-gray-400">
                  Update: {new Date(goldUpdatedAt).toLocaleDateString("id-ID")}
                  {goldSource === "fallback" && " (cache)"}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-semibold text-yellow-600">{fmt(goldTotal)}</span>
            <button onClick={fetchGoldPrice}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-0.5 ml-auto">
              {goldLoading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
              Refresh harga
            </button>
          </div>
        </div>
      </div>

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

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit Aset" : "Tambah Aset"}>
        <div className="space-y-3">
          <div>
            <label className="form-label">Nama Aset</label>
            <input className="form-input" placeholder="cth. Tabungan BCA"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Kategori</label>
            <select className="form-input" value={form.category}
              onChange={e => {
                const cat = e.target.value;
                setIsGold(cat === "Emas");
                setForm(f => ({ ...f, category: cat }));
                setGoldVendor(""); setGoldWeight(""); setGoldPriceInfo(null);
              }}>
              {ASSET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {isGold && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 space-y-3">
              <p className="text-xs font-medium text-yellow-700 flex items-center gap-1">
                ✨ Harga Emas Otomatis
                {goldLoading && <Loader2 size={11} className="animate-spin ml-1" />}
              </p>
              <div>
                <label className="form-label">Merk Emas</label>
                <select className="form-input" value={goldVendor}
                  onChange={e => { setGoldVendor(e.target.value); setGoldWeight(""); setGoldPriceInfo(null); }}>
                  <option value="">-- Pilih Merk --</option>
                  {vendors.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              {goldVendor && (
                <div>
                  <label className="form-label">Berat (gram)</label>
                  <select className="form-input" value={goldWeight}
                    onChange={e => setGoldWeight(parseFloat(e.target.value))}>
                    <option value="">-- Pilih Berat --</option>
                    {weights.map(w => <option key={w} value={w}>{w} gram</option>)}
                  </select>
                </div>
              )}
              {goldPriceInfo && (
                <div className="bg-white border border-yellow-200 rounded-lg p-2.5 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Harga Jual</span>
                    <span className="font-medium text-gray-800">{fmt(goldPriceInfo.buyPrice)}</span>
                  </div>
                  {goldPriceInfo.sellPrice > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Harga Buyback</span>
                      <span className="font-medium text-gray-800">{fmt(goldPriceInfo.sellPrice)}</span>
                    </div>
                  )}
                  <p className="text-xs text-yellow-600 mt-1">Nilai aset otomatis diisi dari harga buyback</p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="form-label">Nilai (Rp){isGold && goldPriceInfo ? " — terisi otomatis" : ""}</label>
            <input className="form-input" type="number" placeholder="0"
              value={form.value || ""}
              onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="form-label">Catatan (opsional)</label>
            <input className="form-input" placeholder="cth. 10 gram Antam"
              value={form.notes ?? ""}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
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