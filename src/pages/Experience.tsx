import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventsList } from "@/features/experience/EventsList";
import { ToolsMarketplace } from "@/features/experience/ToolsMarketplace";

type ExperienceTab = 'events' | 'tools';

const normalizeExperienceTab = (tab: string | null): ExperienceTab => {
  return tab === 'tools' ? 'tools' : 'events';
};

export default function Experience() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ExperienceTab>(() => {
    return normalizeExperienceTab(searchParams.get('tab'));
  });

  const handleTabChange = (newTab: string) => {
    const tab = newTab as ExperienceTab;
    setActiveTab(tab);
    
    const newParams = new URLSearchParams(searchParams);
    if (tab !== 'events') {
      newParams.set('tab', tab);
    } else {
      newParams.delete('tab');
    }
    setSearchParams(newParams, { replace: true });
  };

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-b border-border">
          <div className="container max-w-6xl mx-auto py-12">
            <div className="text-center space-y-4">
              <h1 className="text-heading-xl font-bold">Experience</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Discover art events, workshops, and curated tools from trusted vendors.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border z-30">
          <div className="container max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="events" className="flex-1 sm:flex-none">
                  Events
                </TabsTrigger>
                <TabsTrigger value="tools" className="flex-1 sm:flex-none">
                  Art Tools
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-6xl mx-auto py-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsContent value="events" className="mt-0">
              <EventsList />
            </TabsContent>
            <TabsContent value="tools" className="mt-0">
              <ToolsMarketplace />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}