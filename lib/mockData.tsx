import { Transaction, Asset } from "./types";

const now = new Date();
const y = now.getFullYear();
const mo = now.getMonth();

const d = (monthOffset: number, day: number): string => {
  const dt = new Date(y, mo + monthOffset, day);
  return dt.toISOString().split("T")[0];
};

export const mockTransactions: Transaction[] = [
  // 3 months ago
  { id: "t1",  type: "income",  amount: 8500000, category: "Gaji",         description: "Gaji bulan lalu",     date: d(-3, 1)  },
  { id: "t2",  type: "expense", amount: 1200000, category: "Makanan",      description: "Groceries",            date: d(-3, 5)  },
  { id: "t3",  type: "expense", amount: 500000,  category: "Transportasi", description: "Bensin & Parkir",      date: d(-3, 10) },
  { id: "t4",  type: "expense", amount: 800000,  category: "Tagihan",      description: "Listrik & Internet",   date: d(-3, 15) },
  { id: "t5",  type: "income",  amount: 1500000, category: "Freelance",    description: "Project desain logo",  date: d(-3, 20) },
  { id: "t6",  type: "expense", amount: 450000,  category: "Hiburan",      description: "Netflix & Spotify",    date: d(-3, 25) },
  // 2 months ago
  { id: "t7",  type: "income",  amount: 8500000, category: "Gaji",         description: "Gaji bulan lalu",     date: d(-2, 1)  },
  { id: "t8",  type: "expense", amount: 1350000, category: "Makanan",      description: "Groceries",            date: d(-2, 6)  },
  { id: "t9",  type: "expense", amount: 600000,  category: "Transportasi", description: "Grab & Bensin",        date: d(-2, 11) },
  { id: "t10", type: "expense", amount: 2500000, category: "Belanja",      description: "Baju & Sepatu",        date: d(-2, 18) },
  { id: "t11", type: "income",  amount: 2000000, category: "Bisnis",       description: "Jualan online",        date: d(-2, 22) },
  { id: "t12", type: "expense", amount: 750000,  category: "Kesehatan",    description: "Dokter & Obat",        date: d(-2, 28) },
  // 1 month ago
  { id: "t13", type: "income",  amount: 8500000, category: "Gaji",         description: "Gaji bulan lalu",     date: d(-1, 1)  },
  { id: "t14", type: "expense", amount: 1100000, category: "Makanan",      description: "Groceries",            date: d(-1, 4)  },
  { id: "t15", type: "expense", amount: 550000,  category: "Transportasi", description: "Bensin",               date: d(-1, 9)  },
  { id: "t16", type: "income",  amount: 3500000, category: "Freelance",    description: "Web development",      date: d(-1, 15) },
  { id: "t17", type: "expense", amount: 900000,  category: "Tagihan",      description: "Listrik & Air",        date: d(-1, 18) },
  { id: "t18", type: "expense", amount: 1800000, category: "Pendidikan",   description: "Kursus online",        date: d(-1, 24) },
  // This month
  { id: "t19", type: "income",  amount: 8500000, category: "Gaji",         description: "Gaji bulan ini",      date: d(0, 1)   },
  { id: "t20", type: "expense", amount: 980000,  category: "Makanan",      description: "Groceries",            date: d(0, 3)   },
  { id: "t21", type: "expense", amount: 450000,  category: "Transportasi", description: "Grab monthly",         date: d(0, 5)   },
  { id: "t22", type: "income",  amount: 1200000, category: "Investasi",    description: "Dividen saham",        date: d(0, 8)   },
  { id: "t23", type: "expense", amount: 650000,  category: "Hiburan",      description: "Konser & nonton",      date: d(0, 10)  },
  { id: "t24", type: "expense", amount: 800000,  category: "Tagihan",      description: "Internet & PLN",       date: d(0, 12)  },
];

export const mockAssets: Asset[] = [
  { id: "a1", name: "Tabungan BCA",        value: 45000000, category: "Rekening Bank", notes: "Rekening utama"  },
  { id: "a2", name: "Reksa Dana Syariah",  value: 20000000, category: "Investasi",     notes: "Bibit"           },
  { id: "a3", name: "Honda Vario 2022",    value: 18500000, category: "Kendaraan",     notes: "Motor harian"    },
  { id: "a4", name: "Emas Antam 10gr",     value: 12000000, category: "Emas",          notes: "Simpanan"        },
  { id: "a5", name: "Bitcoin 0.05 BTC",    value: 9500000,  category: "Kripto",        notes: "Binance"         },
  { id: "a6", name: "Saham BBCA",          value: 15000000, category: "Investasi",     notes: "Portofolio"      },
];
