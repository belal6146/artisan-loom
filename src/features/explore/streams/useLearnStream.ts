import { useInfiniteQuery } from "@tanstack/react-query";
import { exploreClient } from "@/lib/exploreClient";
import type { Sort, Pager } from "@/lib/filters";

interface UseLearnStreamProps {
  sort: Sort;
  pager: Pager;
  filters?: {
    type?: 'video' | 'image' | 'pdf';
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  };
}

export const useLearnStream = ({ sort, pager, filters }: UseLearnStreamProps) => {
  return useInfiniteQuery({
    queryKey: ['explore', 'learn', sort, filters],
    queryFn: ({ pageParam }) => 
      exploreClient.getLearn({ 
        sort, 
        cursor: pageParam,
        limit: pager.limit,
        ...filters
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 10 * 60 * 1000, // 10 minutes (educational content changes slowly)
  });
};