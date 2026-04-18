"use client";

import { useState, useMemo, useEffect } from "react";
import { useFinance, fmt } from "@/lib/store";
import { Asset, ASSET_CATEGORIES } from "@/lib/types";
import Modal from "@/components/Modal";
import { Plus, Pencil, Trash2, Landmark, RefreshCw, Loader2 } from "lucide-react";
import type { GoldData, GoldEntry } from "@/app/api/gold-price/route";

const blank = (): Omit<Asset, "id"> => ({
  name: "", value: 0, category: ASSET_CATEGORIES[0], notes: "",
  gold_vendor: "", gold_weight: undefined,
});

export default function AssetsPage() {
  const { state: { assets, loading }, addAsset, updateAsset, deleteAsset } = useFinance();
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState<Omit<Asset, "id">>(blank());
  const [editId, setEditId]   = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  const [goldData, setGoldData]           = useState<GoldData | null>(null);
  const [goldLoading, setGoldLoading]     = useState(false);
  const [goldUpdatedAt, setGoldUpdatedAt] = useState<string>("");
  const [goldSource, setGoldSource]       = useState<string>("");

  // Form state emas
  const [isGold, setIsGold]               = useState(false);
  const [goldVendor, setGoldVendor]       = useState("");
  const [goldWeight, setGoldWeight]       = useState<number | "">("");
  const [goldPriceInfo, setGoldPriceInfo] = useState<GoldEntry | null>(null);

  const fetchGoldPrice = async () => {
    setGoldLoading(true);
    try {
      const res  = await fetch(`/api/gold-price?t=${Date.now()}`, { cache: "no-store" });
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

  // Hitung harga realtime dari goldData untuk aset emas yang sudah tersimpan
  function getRealtimeValue(asset: Asset): number {
    if (asset.category !== "Emas" || !asset.gold_vendor || !asset.gold_weight || !goldData) {
      return asset.value;
    }
    const entries = goldData[asset.gold_vendor];
    if (!entries) return asset.value;
    const exact = entries.find(e => e.weight === asset.gold_weight);
    if (exact) return exact.sellPrice;
    // Interpolasi dari harga per gram
    const perGram = entries.find(e => e.weight === 1);
    if (perGram) return Math.round(perGram.sellPrice * asset.gold_weight);
    return asset.value;
  }

  // Update harga emas di form saat vendor/berat berubah
  useEffect(() => {
    if (!goldData || !goldVendor || !goldWeight) { setGoldPriceInfo(null); return; }
    const entries = goldData[goldVendor];
    if (!entries) { setGoldPriceInfo(null); return; }
    const exact = entries.find(e => e.weight === goldWeight);
    if (exact) {
      setGoldPriceInfo(exact);
      setForm(f => ({ ...f, value: exact.sellPrice, gold_vendor: goldVendor, gold_weight: goldWeight as number }));
    } else {
      const perGram = entries.find(e => e.weight === 1);
      if (perGram) {
        const estimated = Math.round(perGram.sellPrice * (goldWeight as number));
        setGoldPriceInfo({ weight: goldWeight as number, buyPrice: Math.round(perGram.buyPrice * (goldWeight as number)), sellPrice: estimated });
        setForm(f => ({ ...f, value: estimated, gold_vendor: goldVendor, gold_weight: goldWeight as number }));
      }
    }
  }, [goldVendor, goldWeight, goldData]);

  const filtered = useMemo(() =>
    filterCat === "all" ? assets : assets.filter(a => a.category === filterCat),
  [assets, filterCat]);

  // Total pakai harga realtime untuk emas
  const total = useMemo(() =>
    assets.reduce((s, a) => s + getRealtimeValue(a), 0),
  [assets, goldData]);

  const goldTotal = useMemo(() =>
    assets.filter(a => a.category === "Emas").reduce((s, a) => s + getRealtimeValue(a), 0),
  [assets, goldData]);

  function openNew() {
    setEditId(null); setForm(blank()); setIsGold(false);
    setGoldVendor(""); setGoldWeight(""); setGoldPriceInfo(null);
    setOpen(true);
  }

  function openEdit(a: Asset) {
    setEditId(a.id);
    setForm({ name: a.name, value: a.value, category: a.category, notes: a.notes ?? "", gold_vendor: a.gold_vendor ?? "", gold_weight: a.gold_weight });
    setIsGold(a.category === "Emas");
    setGoldVendor(a.gold_vendor ?? "");
    setGoldWeight(a.gold_weight ?? "");
    setGoldPriceInfo(null);
    setOpen(true);
  }

  async function save() {
    if (!form.name) return;
    setSaving(true);
    // Untuk emas, simpan value terkini + vendor + weight
    const toSave = { ...form };
    if (isGold && goldPriceInfo) {
      toSave.value       = goldPriceInfo.sellPrice;
      toSave.gold_vendor = goldVendor;
      toSave.gold_weight = goldWeight as number;
    }
    if (editId) await updateAsset({ id: editId, ...toSave });
    else await addAsset(toSave);
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
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Memuat data...</div>
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
                  {goldSource === "live" ? "Harga realtime" : "Data cache"} · {new Date(goldUpdatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
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
          {filtered.map(a => {
            const realtimeVal = getRealtimeValue(a);
            const isGoldAsset = a.category === "Emas" && a.gold_vendor && a.gold_weight;
            return (
              <div key={a.id} className="card flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.name}</p>
                    {a.notes && <p className="text-xs text-gray-400 mt-0.5">{a.notes}</p>}
                    {isGoldAsset && (
                      <p className="text-xs text-yellow-600 mt-0.5">{a.gold_vendor} · {a.gold_weight}gr</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${catColor[a.category] ?? catColor["Lainnya"]}`}>
                    {a.category}
                  </span>
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-900">{fmt(realtimeVal)}</p>
                  {isGoldAsset && realtimeVal !== a.value && (
                    <p className="text-xs text-emerald-500 mt-0.5">
                      Harga hari ini (buyback)
                    </p>
                  )}
                  {goldLoading && isGoldAsset && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin" /> Memperbarui harga...
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                  <button className="btn text-xs py-1 px-3" onClick={() => openEdit(a)}>
                    <Pencil size={12} /> Edit
                  </button>
                  <button className="btn btn-danger text-xs py-1 px-3" onClick={() => del(a.id)}>
                    <Trash2 size={12} /> Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit Aset" : "Tambah Aset"}>
        <div className="space-y-3">
          <div>
            <label className="form-label">Nama Aset</label>
            <input className="form-input" placeholder="cth. Emas Antam 10gr"
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
                if (cat !== "Emas") { setGoldVendor(""); setGoldWeight(""); setGoldPriceInfo(null); }
              }}>
              {ASSET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {isGold && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 space-y-3">
              <p className="text-xs font-medium text-yellow-700 flex items-center gap-1">
                ✨ Harga Emas Otomatis & Realtime
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
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Harga Buyback</span>
                    <span className="font-medium text-emerald-600">{fmt(goldPriceInfo.sellPrice)}</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">Nilai aset mengikuti harga buyback setiap hari</p>
                </div>
              )}
            </div>
          )}

          {!isGold && (
            <div>
              <label className="form-label">Nilai (Rp)</label>
              <input className="form-input" type="number" placeholder="0"
                value={form.value || ""}
                onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))} />
            </div>
          )}

          <div>
            <label className="form-label">Catatan (opsional)</label>
            <input className="form-input" placeholder="cth. Simpanan jangka panjang"
              value={form.notes ?? ""}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn" onClick={() => setOpen(false)}>Batal</button>
          <button className="btn btn-primary" onClick={save} disabled={saving || (isGold && !goldPriceInfo)}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </Modal>
    </div>
  );
}