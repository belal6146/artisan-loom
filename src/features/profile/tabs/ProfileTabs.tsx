import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabValue = "overview" | "artwork" | "feed" | "collaborations" | "connections" | "insights" | "ai-explorer";

interface ExtraTab {
  key: string;
  label: string;
  element: React.ReactNode;
}

interface ProfileTabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  isOwnProfile: boolean;
  className?: string;
  extraTabs?: ExtraTab[];
}

export const ProfileTabs = ({ activeTab, onTabChange, isOwnProfile, className, extraTabs = [] }: ProfileTabsProps) => {
  const baseTabs = [
    { value: "overview", label: "Overview" },
    { value: "artwork", label: "Artwork" },
    { value: "feed", label: "Feed" },
    { value: "collaborations", label: "Collaborations" },
    { value: "connections", label: "Connections" },
    { value: "insights", label: "Insights" },
  ] as const;

  const allTabs = [
    ...baseTabs,
    ...extraTabs.map(tab => ({ value: tab.key as TabValue, label: tab.label }))
  ];

  return (
    <div className={`sticky top-24 bg-background/95 backdrop-blur-sm border-b border-border z-30 py-2 ${className}`}>
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabValue)}>
        <TabsList className="w-full justify-start overflow-x-auto no-scrollbar" role="tablist">
          {allTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-shrink-0 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              role="tab"
              aria-selected={activeTab === tab.value}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};