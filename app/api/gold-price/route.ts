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

// Harga per gram dari berbagai sumber
async function fetchPerGram(): Promise<Record<string, { buy: number; sell: number }>> {
  const sources = ["pegadaian", "lakuemas", "hargaemas-org"];
  const results: Record<string, { buy: number; sell: number }> = {};

  await Promise.allSettled(
    sources.map(async (src) => {
      try {
        const res  = await fetch(`https://logam-mulia-api.vercel.app/prices/${src}`, {
          cache: "no-store",
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        const json = await res.json();
        if (json?.data?.length) {
          for (const item of json.data) {
            const type = (item.type || item.name || "").toUpperCase();
            if (item.buy && item.sell) {
              results[type] = { buy: item.buy, sell: item.sell };
            }
          }
        }
      } catch {}
    })
  );

  return results;
}

// Buat tabel berat dari harga per gram
function buildWeightTable(pricePerGram: number, sellPerGram: number, weights: number[]): GoldEntry[] {
  return weights.map(w => ({
    weight:    w,
    buyPrice:  Math.round(pricePerGram * w),
    sellPrice: Math.round(sellPerGram * w),
  }));
}

export async function GET() {
  try {
    const perGram = await fetchPerGram();

    // Berat standar yang tersedia
    const standardWeights  = [0.5, 1, 2, 3, 5, 10, 25, 50, 100];
    const antamWeights     = [0.5, 1, 2, 3, 5, 10, 25, 50, 100];
    const ubsWeights       = [0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500];

    const goldData: GoldData = {};

    // ANTAM
    const antamSrc = perGram["ANTAM"] || perGram["LM ANTAM"];
    if (antamSrc) {
      goldData["ANTAM"] = buildWeightTable(antamSrc.buy, antamSrc.sell, antamWeights);
    }

    // UBS
    const ubsSrc = perGram["UBS"];
    if (ubsSrc) {
      goldData["UBS"] = buildWeightTable(ubsSrc.buy, ubsSrc.sell, ubsWeights);
    }

    // Galeri24 / Pegadaian
    const galeriSrc = perGram["GALERI24"] || perGram["GALERI 24"] || perGram["G24"];
    if (galeriSrc) {
      goldData["GALERI 24"] = buildWeightTable(galeriSrc.buy, galeriSrc.sell, standardWeights);
    }

    const isEmpty = Object.keys(goldData).length === 0;

    // Fallback hardcode jika semua fetch gagal
    if (isEmpty) {
      goldData["ANTAM"] = [
        { weight: 0.5, buyPrice: 1539000, sellPrice: 1347000 },
        { weight: 1,   buyPrice: 2972000, sellPrice: 2695000 },
        { weight: 2,   buyPrice: 5881000, sellPrice: 5390000 },
        { weight: 5,   buyPrice: 14623000, sellPrice: 13476000 },
        { weight: 10,  buyPrice: 29188000, sellPrice: 26952000 },
        { weight: 25,  buyPrice: 72839000, sellPrice: 67049000 },
        { weight: 50,  buyPrice: 145595000, sellPrice: 134099000 },
        { weight: 100, buyPrice: 291109000, sellPrice: 268199000 },
      ];
      goldData["UBS"] = [
        { weight: 0.5, buyPrice: 1562000, sellPrice: 1347000 },
        { weight: 1,   buyPrice: 2890000, sellPrice: 2695000 },
        { weight: 2,   buyPrice: 5734000, sellPrice: 5390000 },
        { weight: 5,   buyPrice: 14171000, sellPrice: 13476000 },
        { weight: 10,  buyPrice: 28192000, sellPrice: 26952000 },
        { weight: 25,  buyPrice: 70342000, sellPrice: 67049000 },
        { weight: 50,  buyPrice: 140395000, sellPrice: 134099000 },
        { weight: 100, buyPrice: 280679000, sellPrice: 268199000 },
      ];
      goldData["GALERI 24"] = [
        { weight: 0.5, buyPrice: 1508000, sellPrice: 1348000 },
        { weight: 1,   buyPrice: 2876000, sellPrice: 2697000 },
        { weight: 2,   buyPrice: 5683000, sellPrice: 5395000 },
        { weight: 5,   buyPrice: 14102000, sellPrice: 13489000 },
        { weight: 10,  buyPrice: 28130000, sellPrice: 26978000 },
        { weight: 25,  buyPrice: 69944000, sellPrice: 67116000 },
        { weight: 50,  buyPrice: 139778000, sellPrice: 134233000 },
        { weight: 100, buyPrice: 279418000, sellPrice: 268467000 },
      ];
    }

    return NextResponse.json(
      {
        data: goldData,
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
    return NextResponse.json({ error: "Gagal fetch data emas" }, { status: 500 });
  }
}