import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import type { ExploreTab, Sort } from "@/lib/filters";
import { ArrowUpDown, Clock } from "lucide-react";

interface ExploreTabsProps {
  activeTab: ExploreTab;
  onTabChange: (tab: ExploreTab) => void;
  sort: Sort;
  onSortChange: (sort: Sort) => void;
  className?: string;
}

const tabs: { value: ExploreTab; label: string }[] = [
  { value: "for-you", label: "For You" },
  { value: "following", label: "Following" },
  { value: "nearby", label: "Nearby" },
  { value: "trending", label: "Trending" },
  { value: "collaborations", label: "Collaborations" },
  { value: "learn", label: "Learn" },
];

export const ExploreTabs = ({ 
  activeTab, 
  onTabChange, 
  sort, 
  onSortChange, 
  className 
}: ExploreTabsProps) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Remember last used tab
    storage.set('explore-last-tab', activeTab);
  }, [activeTab]);

  const handleTabChange = (newTab: string) => {
    onTabChange(newTab as ExploreTab);
  };

  const toggleSort = () => {
    onSortChange(sort === "rank" ? "latest" : "rank");
  };

  return (
    <div className={`sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border z-30 py-3 ${isSticky ? 'shadow-sm' : ''} ${className}`}>
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <Tabs 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="flex-1 overflow-hidden"
          >
            <TabsList 
              className="flex overflow-x-auto no-scrollbar w-full justify-start"
              role="tablist"
            >
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-shrink-0 px-4 py-2 min-h-[44px] text-sm font-medium transition-smooth"
                  role="tab"
                  aria-selected={activeTab === tab.value}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleSort}
            className="flex-shrink-0 min-h-[44px]"
            aria-label={`Sort by ${sort === "rank" ? "latest" : "relevance"}`}
          >
            {sort === "rank" ? (
              <>
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Rank
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Latest
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};