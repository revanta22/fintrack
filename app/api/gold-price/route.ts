import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface GoldEntry {
  weight: number;
  buyPrice: number;
  sellPrice: number;
}

export interface GoldData {
  [vendor: string]: GoldEntry[];
}

function parseRp(str: string): number {
  return parseInt(str.replace(/[Rp.,\s]/g, "")) || 0;
}

export async function GET() {
  try {
    const res = await fetch("https://galeri24.co.id/harga-emas", {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "id-ID,id;q=0.9",
      },
    });

    const html = await res.text();
    const goldData: GoldData = {};

    // Split by "Diperbarui" untuk dapat tiap blok vendor
    const blocks = html.split(/Diperbarui\s+\w+,\s+\d+\s+\w+\s+\d+/);

    for (const block of blocks) {
      // Cari nama vendor: "Harga ANTAM", "Harga UBS", dst
      const vendorMatch = block.match(/Harga\s+([A-Z][A-Z0-9 ]+?)(?:\s*-\s*[A-Z][A-Z0-9 ]+?)?\s*\n/);
      if (!vendorMatch) continue;

      const vendor = vendorMatch[1].trim();
      if (!vendor || vendor === "Emas") continue;

      const entries: GoldEntry[] = [];

      // Match baris: angka  Rp...  Rp...
      const rowRegex = /([\d.]+)\s+Rp([\d.,]+)\s+Rp([\d.,]+)/g;
      let match;

      while ((match = rowRegex.exec(block)) !== null) {
        const weight    = parseFloat(match[1]);
        const buyPrice  = parseRp("Rp" + match[2]);
        const sellPrice = parseRp("Rp" + match[3]);
        if (weight > 0 && buyPrice > 0) {
          entries.push({ weight, buyPrice, sellPrice });
        }
      }

      if (entries.length > 0) goldData[vendor] = entries;
    }

    const isEmpty = Object.keys(goldData).length === 0;

    // Fallback dengan data terbaru dari Galeri24 (17 Apr 2026)
    const fallback: GoldData = {
      "GALERI 24": [
        { weight: 0.5,  buyPrice: 1507000,    sellPrice: 1347000    },
        { weight: 1,    buyPrice: 2873000,    sellPrice: 2694000    },
        { weight: 2,    buyPrice: 5676000,    sellPrice: 5389000    },
        { weight: 5,    buyPrice: 14086000,   sellPrice: 13474000   },
        { weight: 10,   buyPrice: 28098000,   sellPrice: 26948000   },
        { weight: 25,   buyPrice: 69866000,   sellPrice: 67040000   },
        { weight: 50,   buyPrice: 139620000,  sellPrice: 134081000  },
        { weight: 100,  buyPrice: 279101000,  sellPrice: 268162000  },
        { weight: 250,  buyPrice: 696039000,  sellPrice: 667104000  },
        { weight: 500,  buyPrice: 1392077000, sellPrice: 1334208000 },
        { weight: 1000, buyPrice: 2784153000, sellPrice: 2668417000 },
      ],
      "ANTAM": [
        { weight: 0.5, buyPrice: 1544000,  sellPrice: 1346000  },
        { weight: 1,   buyPrice: 2983000,  sellPrice: 2692000  },
        { weight: 2,   buyPrice: 5904000,  sellPrice: 5384000  },
        { weight: 3,   buyPrice: 8829000,  sellPrice: 8076000  },
        { weight: 5,   buyPrice: 14680000, sellPrice: 13460000 },
        { weight: 10,  buyPrice: 29302000, sellPrice: 26921000 },
        { weight: 25,  buyPrice: 73125000, sellPrice: 66973000 },
        { weight: 50,  buyPrice: 146167000,sellPrice: 133947000},
        { weight: 100, buyPrice: 292253000,sellPrice: 267894000},
      ],
      "UBS": [
        { weight: 0.5, buyPrice: 1569000,   sellPrice: 1346000   },
        { weight: 1,   buyPrice: 2902000,   sellPrice: 2692000   },
        { weight: 2,   buyPrice: 5760000,   sellPrice: 5384000   },
        { weight: 5,   buyPrice: 14233000,  sellPrice: 13460000  },
        { weight: 10,  buyPrice: 28316000,  sellPrice: 26921000  },
        { weight: 25,  buyPrice: 70651000,  sellPrice: 66973000  },
        { weight: 50,  buyPrice: 141011000, sellPrice: 133947000 },
        { weight: 100, buyPrice: 281911000, sellPrice: 267894000 },
        { weight: 250, buyPrice: 704569000, sellPrice: 666437000 },
        { weight: 500, buyPrice: 1407483000,sellPrice: 1332875000},
      ],
      "ANTAM MULIA RETRO": [
        { weight: 0.5, buyPrice: 1584000,  sellPrice: 1346000  },
        { weight: 1,   buyPrice: 2944000,  sellPrice: 2692000  },
        { weight: 2,   buyPrice: 5791000,  sellPrice: 5384000  },
        { weight: 3,   buyPrice: 8577000,  sellPrice: 8076000  },
        { weight: 5,   buyPrice: 14378000, sellPrice: 13460000 },
        { weight: 10,  buyPrice: 28630000, sellPrice: 26921000 },
        { weight: 25,  buyPrice: 71399000, sellPrice: 66973000 },
        { weight: 50,  buyPrice: 142726000,sellPrice: 133947000},
        { weight: 100, buyPrice: 285170000,sellPrice: 267894000},
      ],
      "LOTUS ARCHI": [
        { weight: 1,   buyPrice: 2919000,  sellPrice: 2692000  },
        { weight: 5,   buyPrice: 14370000, sellPrice: 13460000 },
        { weight: 10,  buyPrice: 28541000, sellPrice: 26921000 },
        { weight: 25,  buyPrice: 70964000, sellPrice: 66973000 },
        { weight: 50,  buyPrice: 141898000,sellPrice: 133947000},
        { weight: 100, buyPrice: 283615000,sellPrice: 267894000},
      ],
      "UBS DISNEY": [
        { weight: 0.5, buyPrice: 1572000,  sellPrice: 1346000 },
        { weight: 2,   buyPrice: 5771000,  sellPrice: 5384000 },
        { weight: 5,   buyPrice: 14192000, sellPrice: 13460000},
        { weight: 10,  buyPrice: 28189000, sellPrice: 26921000},
      ],
    };

    return NextResponse.json(
      {
        data: isEmpty ? fallback : goldData,
        source: isEmpty ? "fallback" : "live",
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Gagal fetch" }, { status: 500 });
  }
}