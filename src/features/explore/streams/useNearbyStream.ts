import { useInfiniteQuery } from "@tanstack/react-query";
import { exploreClient } from "@/lib/exploreClient";
import type { Sort, Pager, NearbyFilters } from "@/lib/filters";

interface UseNearbyStreamProps {
  sort: Sort;
  pager: Pager;
  filters: NearbyFilters;
}

export const useNearbyStream = ({ sort, pager, filters }: UseNearbyStreamProps) => {
  return useInfiniteQuery({
    queryKey: ['explore', 'nearby', sort, filters],
    queryFn: ({ pageParam }) => 
      exploreClient.getNearby({ 
        sort, 
        cursor: pageParam,
        limit: pager.limit,
        ...filters
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!(filters.lat && filters.lng), // Only run if location available
  });
};