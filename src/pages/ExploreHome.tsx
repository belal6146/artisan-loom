import { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ExploreTabs } from "@/features/explore/ExploreTabs";
import { GlobalComposer } from "@/features/explore/GlobalComposer";
import { ForYouStream } from "@/features/explore/streams/ForYouStream";
import { FollowingStream } from "@/features/explore/streams/FollowingStream";
import { NearbyStream } from "@/features/explore/streams/NearbyStream";
import { TrendingStream } from "@/features/explore/streams/TrendingStream";
import { CollaborationsStream } from "@/features/explore/streams/CollaborationsStream";
import { LearnStream } from "@/features/explore/streams/LearnStream";
import { storage } from "@/lib/storage";
import { normalizeTab, normalizeSort } from "@/lib/filters";
import type { ExploreTab, Sort } from "@/lib/filters";

export default function ExploreHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ExploreTab>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) return normalizeTab(tabParam);
    
    // Try to restore last used tab
    const lastTab = storage.get('explore-last-tab') as string;
    return normalizeTab(lastTab);
  });
  
  const [sort, setSort] = useState<Sort>(() => {
    return normalizeSort(searchParams.get('sort'));
  });

  // Update URL when tab or sort changes
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (activeTab !== 'for-you') newParams.set('tab', activeTab);
    if (sort !== 'rank') newParams.set('sort', sort);
    
    const newSearch = newParams.toString();
    const currentSearch = searchParams.toString();
    
    if (newSearch !== currentSearch) {
      setSearchParams(newParams, { replace: true });
    }
  }, [activeTab, sort, setSearchParams]);

  const handleTabChange = (newTab: ExploreTab) => {
    setActiveTab(newTab);
  };

  const handleSortChange = (newSort: Sort) => {
    setSort(newSort);
  };

  const handlePostCreated = () => {
    // Invalidate queries to show new post
    // In a real app, this would trigger react-query invalidation
  };

  const handleItemAction = (action: string, itemId: string) => {
    console.log('Item action:', action, itemId);
    // Handle like, save, follow actions
  };

  const renderStream = () => {
    const streamProps = {
      sort,
      pager: { limit: 20 },
      onItemAction: handleItemAction,
      className: "max-w-2xl mx-auto"
    };

    switch (activeTab) {
      case 'for-you':
        return <ForYouStream {...streamProps} />;
      case 'following':
        return <FollowingStream {...streamProps} />;
      case 'nearby':
        return <NearbyStream {...streamProps} />;
      case 'trending':
        return <TrendingStream {...streamProps} />;
      case 'collaborations':
        return <CollaborationsStream {...streamProps} />;
      case 'learn':
        return <LearnStream {...streamProps} />;
      default:
        return <ForYouStream {...streamProps} />;
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero section with gradient background */}
        <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-b border-border">
          <div className="container max-w-6xl mx-auto py-8">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-heading-xl font-bold mb-2">Explore</h1>
              <p className="text-muted-foreground mb-6">
                Discover art, connect with creators, and find inspiration
              </p>
              
              <GlobalComposer 
                currentTab={activeTab}
                onPostCreated={handlePostCreated}
              />
            </div>
          </div>
        </div>

        {/* Sticky tabs */}
        <ExploreTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          sort={sort}
          onSortChange={handleSortChange}
        />

        {/* Content streams */}
        <div className="container max-w-6xl mx-auto py-6">
          {renderStream()}
        </div>
      </div>
    </AppLayout>
  );
}