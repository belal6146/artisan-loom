import { useInfiniteQuery } from "@tanstack/react-query";
import { exploreClient } from "@/lib/exploreClient";
import type { Sort, Pager } from "@/lib/filters";

interface UseFollowingStreamProps {
  sort: Sort;
  pager: Pager;
}

export const useFollowingStream = ({ sort, pager }: UseFollowingStreamProps) => {
  return useInfiniteQuery({
    queryKey: ['explore', 'following', sort],
    queryFn: ({ pageParam }) => 
      exploreClient.getFollowing({ 
        sort, 
        cursor: pageParam,
        limit: pager.limit 
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};