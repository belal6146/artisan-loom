import { useInfiniteQuery } from "@tanstack/react-query";
import { exploreClient } from "@/lib/exploreClient";
import type { Sort, Pager } from "@/lib/filters";

interface UseCollaborationsStreamProps {
  sort: Sort;
  pager: Pager;
  filters?: {
    compensationType?: string;
    skills?: string[];
    location?: string;
  };
}

export const useCollaborationsStream = ({ sort, pager, filters }: UseCollaborationsStreamProps) => {
  return useInfiniteQuery({
    queryKey: ['explore', 'collaborations', sort, filters],
    queryFn: ({ pageParam }) => 
      exploreClient.getCollaborations({ 
        sort, 
        cursor: pageParam,
        limit: pager.limit,
        ...filters
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};