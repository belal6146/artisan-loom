import { useInfiniteQuery } from "@tanstack/react-query";
import { exploreClient } from "@/lib/exploreClient";
import type { Sort, Pager } from "@/lib/filters";

interface UseTrendingStreamProps {
  sort: Sort;
  pager: Pager;
  timeframe?: '24h' | '7d';
}

export const useTrendingStream = ({ sort, pager, timeframe = '24h' }: UseTrendingStreamProps) => {
  return useInfiniteQuery({
    queryKey: ['explore', 'trending', sort, timeframe],
    queryFn: ({ pageParam }) => 
      exploreClient.getTrending({ 
        sort, 
        cursor: pageParam,
        limit: pager.limit,
        timeframe
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1 * 60 * 1000, // 1 minute (trending changes quickly)
  });
};

// Utility function for hot score calculation
export function hotScore({ 
  likes, 
  comments, 
  saves, 
  createdAt 
}: {
  likes: number;
  comments: number; 
  saves: number;
  createdAt: string;
}) {
  const hours = Math.max(1, (Date.now() - new Date(createdAt).getTime()) / 36e5);
  const weight = likes * 3 + comments * 4 + saves * 5;
  return weight / Math.pow(1 + hours / 12, 1.2);
}