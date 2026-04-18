export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  category: string;
  notes?: string;
  gold_vendor?: string;  // merk emas, disimpan permanen
  gold_weight?: number;  // berat gram, disimpan permanen
}

export const INCOME_CATEGORIES = [
  "Gaji", "Freelance", "Investasi", "Bisnis", "Lainnya",
];

export const EXPENSE_CATEGORIES = [
  "Makanan", "Transportasi", "Tagihan", "Hiburan",
  "Kesehatan", "Belanja", "Pendidikan", "Lainnya",
];

export const ASSET_CATEGORIES = [
  "Rekening Bank", "Investasi", "Properti",
  "Kendaraan", "Kripto", "Emas", "Lainnya",
];