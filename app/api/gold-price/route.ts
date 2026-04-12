import { NextResponse } from "next/server";

export const revalidate = 3600; // cache 1 jam

export interface GoldEntry {
  weight: number;
  buyPrice: number;
  sellPrice: number;
}

export interface GoldData {
  [vendor: string]: GoldEntry[];
}

export async function GET() {
  try {
    const res = await fetch("https://galeri24.co.id/harga-emas", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    const html = await res.text();

    // Parse vendor blocks
    const vendorRegex =
      /Harga\s+([\w\s]+?)\n[\s\S]*?Berat[\s\S]*?Harga Jual[\s\S]*?Harga Buyback([\s\S]*?)(?=Diperbarui|$)/g;

    const rowRegex =
      /([\d.]+)\s+Rp([\d.,]+)\s+Rp([\d.,]+)/g;

    const goldData: GoldData = {};
    const vendorBlocks = html.split("Diperbarui");

    // Simple text-based parse: split by "Harga [VENDOR]"
    const sections = html.split(/Harga\s+(?=[A-Z])/);

    for (const section of sections) {
      const lines = section.trim().split("\n").map(l => l.trim()).filter(Boolean);
      if (!lines.length) continue;

      // First line = vendor name (before any number)
      const vendorLine = lines[0].replace(/[*()]/g, "").trim();
      if (!vendorLine || /^\d/.test(vendorLine) || vendorLine.length > 40) continue;
      if (!vendorLine.match(/^[A-Z\s\d]+$/)) continue;

      const vendor = vendorLine.trim();
      const entries: GoldEntry[] = [];

      for (const line of lines.slice(1)) {
        const match = line.match(/^([\d.]+)\s+Rp([\d,.]+)\s+Rp([\d,.]+)/);
        if (match) {
          const weight   = parseFloat(match[1]);
          const buyPrice = parseInt(match[2].replace(/[,.]/g, ""));
          const sellPrice = parseInt(match[3].replace(/[,.]/g, ""));
          if (weight && buyPrice) {
            entries.push({ weight, buyPrice, sellPrice });
          }
        }
      }

      if (entries.length > 0) {
        goldData[vendor] = entries;
      }
    }

    // Fallback: hardcode latest data if scraping returns empty
    const isEmpty = Object.keys(goldData).length === 0;
    const fallback: GoldData = {
      "GALERI 24": [
        { weight: 0.5, buyPrice: 1508000, sellPrice: 1348000 },
        { weight: 1,   buyPrice: 2876000, sellPrice: 2697000 },
        { weight: 2,   buyPrice: 5683000, sellPrice: 5395000 },
        { weight: 5,   buyPrice: 14102000, sellPrice: 13489000 },
        { weight: 10,  buyPrice: 28130000, sellPrice: 26978000 },
        { weight: 25,  buyPrice: 69944000, sellPrice: 67116000 },
        { weight: 50,  buyPrice: 139778000, sellPrice: 134233000 },
        { weight: 100, buyPrice: 279418000, sellPrice: 268467000 },
      ],
      "ANTAM": [
        { weight: 0.5, buyPrice: 1539000, sellPrice: 1347000 },
        { weight: 1,   buyPrice: 2972000, sellPrice: 2695000 },
        { weight: 2,   buyPrice: 5881000, sellPrice: 5390000 },
        { weight: 5,   buyPrice: 14623000, sellPrice: 13476000 },
        { weight: 10,  buyPrice: 29188000, sellPrice: 26952000 },
        { weight: 25,  buyPrice: 72839000, sellPrice: 67049000 },
        { weight: 50,  buyPrice: 145595000, sellPrice: 134099000 },
        { weight: 100, buyPrice: 291109000, sellPrice: 268199000 },
      ],
      "UBS": [
        { weight: 0.5, buyPrice: 1562000, sellPrice: 1347000 },
        { weight: 1,   buyPrice: 2890000, sellPrice: 2695000 },
        { weight: 2,   buyPrice: 5734000, sellPrice: 5390000 },
        { weight: 5,   buyPrice: 14171000, sellPrice: 13476000 },
        { weight: 10,  buyPrice: 28192000, sellPrice: 26952000 },
        { weight: 25,  buyPrice: 70342000, sellPrice: 67049000 },
        { weight: 50,  buyPrice: 140395000, sellPrice: 134099000 },
        { weight: 100, buyPrice: 280679000, sellPrice: 268199000 },
      ],
      "ANTAM MULIA RETRO": [
        { weight: 0.5, buyPrice: 1574000, sellPrice: 1347000 },
        { weight: 1,   buyPrice: 2924000, sellPrice: 2695000 },
        { weight: 2,   buyPrice: 5752000, sellPrice: 5390000 },
        { weight: 5,   buyPrice: 14281000, sellPrice: 13476000 },
        { weight: 10,  buyPrice: 28435000, sellPrice: 26952000 },
        { weight: 25,  buyPrice: 70912000, sellPrice: 67049000 },
        { weight: 50,  buyPrice: 141754000, sellPrice: 134099000 },
        { weight: 100, buyPrice: 283228000, sellPrice: 268199000 },
      ],
      "UBS DISNEY": [
        { weight: 0.5, buyPrice: 1565000, sellPrice: 1347000 },
        { weight: 2,   buyPrice: 5746000, sellPrice: 5390000 },
        { weight: 5,   buyPrice: 14129000, sellPrice: 13476000 },
        { weight: 10,  buyPrice: 28066000, sellPrice: 26952000 },
      ],
    };

    return NextResponse.json({
      data: isEmpty ? fallback : goldData,
      source: isEmpty ? "fallback" : "live",
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: "Gagal fetch data emas" }, { status: 500 });
  }
}