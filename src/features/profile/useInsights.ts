import { useQuery } from "@tanstack/react-query";
import { storage } from "@/lib/storage";
import type { ID, Money, Artwork, User } from "@/types";

export type InsightTimelineItem = {
  id: string;
  artworkId: ID;
  title: string;
  artistId: ID;
  artistName: string;
  purchasedAt: string;
  price?: Money;
  showPrice: boolean; // false when artwork.forSale === false (privacy rule)
};

export type Insights = {
  totals: {
    purchases: number;
    totalByCurrency: Record<string, number>; // cents by currency
    avgByCurrency: Record<string, number>; // cents by currency
  };
  topCategories: Array<{ 
    category: "painting" | "sculpture" | "handicraft" | "digital" | "photography" | "other"; 
    count: number; 
    spendByCurrency: Record<string, number> 
  }>;
  topArtists: Array<{ artistId: ID; artistName: string; count: number }>;
  timeline: InsightTimelineItem[];
};

function formatMoney(m: Money | undefined): string {
  if (!m) return "";
  const amount = (m.amount / 100).toFixed(2);
  return `${m.currency} ${amount}`;
}

export function useInsights(userId: ID) {
  return useQuery({
    queryKey: ["insights", userId],
    queryFn: async (): Promise<Insights> => {
      // Get data from localStorage (dev mode)
      const purchasesData = storage.get<any[]>("purchases") || [];
      const artworksData = storage.get<Artwork[]>("artworks") || [];
      const usersData = storage.get<User[]>("users") || [];
      
      // Filter purchases for this user
      const purchases = purchasesData.filter(p => p.buyerId === userId);
      
      const byCurrencyTotal: Record<string, number> = {};
      const byCurrencyAvg: Record<string, number> = {};
      const catMap = new Map<string, { 
        category: Insights["topCategories"][number]["category"]; 
        count: number; 
        spendByCurrency: Record<string, number> 
      }>();
      const artistMap = new Map<string, { artistId: ID; artistName: string; count: number }>();
      const timeline: InsightTimelineItem[] = [];

      for (const p of purchases) {
        const artwork = artworksData.find(aw => aw.id === p.artworkId);
        if (!artwork) continue;
        
        const artist = usersData.find(u => u.id === artwork.userId);
        const currency = p.price.currency;
        const amount = p.price.amount;
        
        byCurrencyTotal[currency] = (byCurrencyTotal[currency] ?? 0) + amount;

        // Category tallies
        const cat = artwork.category;
        const slot = catMap.get(cat) ?? { category: cat, count: 0, spendByCurrency: {} };
        slot.count += 1;
        slot.spendByCurrency[currency] = (slot.spendByCurrency[currency] ?? 0) + amount;
        catMap.set(cat, slot);

        // Artist tallies
        if (artist) {
          const a = artistMap.get(artist.id) ?? { 
            artistId: artist.id, 
            artistName: artist.name, 
            count: 0 
          };
          a.count += 1;
          artistMap.set(artist.id, a);
        }

        // Timeline (respect rule: hide price if artwork currently not for sale)
        timeline.push({
          id: p.id,
          artworkId: p.artworkId,
          title: artwork.title,
          artistId: artwork.userId,
          artistName: artist?.name ?? "Unknown",
          purchasedAt: p.purchasedAt,
          price: p.price,
          showPrice: artwork.forSale === true,
        });
      }

      // Calculate averages per currency
      const count = purchases.length || 1;
      for (const [cur, total] of Object.entries(byCurrencyTotal)) {
        byCurrencyAvg[cur] = Math.round(total / count);
      }

      return {
        totals: { 
          purchases: purchases.length, 
          totalByCurrency: byCurrencyTotal, 
          avgByCurrency: byCurrencyAvg 
        },
        topCategories: Array.from(catMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        topArtists: Array.from(artistMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        timeline: timeline
          .sort((a, b) => +new Date(b.purchasedAt) - +new Date(a.purchasedAt))
          .slice(0, 10),
      };
    },
  });
}

// Helper functions
export function formatCentsMap(map: Record<string, number>): string[] {
  return Object.entries(map).map(([cur, cents]) => 
    `${cur.toUpperCase()} ${(cents / 100).toFixed(2)}`
  );
}

export { formatMoney as fmtMoney };