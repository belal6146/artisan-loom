import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventsList, ToolsMarketplace } from "@/features/experience/ExperienceModules";

type ExperienceTab = 'events' | 'tools';

export default function Experience() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as ExperienceTab) || 'events';

  const handleTabChange = (newTab: string) => {
    const tab = newTab as ExperienceTab;
    
    const newParams = new URLSearchParams(searchParams);
    if (tab !== 'events') {
      newParams.set('tab', tab);
    } else {
      newParams.delete('tab');
    }
    setSearchParams(newParams, { replace: true });
  };

  const onlyVerified = (x: { verified?: boolean }) => x.verified === true;

  return (
    <AppLayout>
      <div className="min-h-screen space-y-8">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border border-border rounded-2xl p-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Experience</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover verified art events, workshops, and curated tools from trusted vendors.
            </p>
          </div>
        </div>

        {/* Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="sticky top-0 z-20 bg-[color-mix(in_srgb,white,transparent_10%)] backdrop-blur-sm border-b rounded-lg p-4">
            <TabsList className="grid w-full grid-cols-2" aria-label="Experience sections">
              <TabsTrigger 
                value="events" 
                className="text-base"
                aria-selected={activeTab === 'events'}
                data-tab="events"
              >
                Events
              </TabsTrigger>
              <TabsTrigger 
                value="tools" 
                className="text-base"
                aria-selected={activeTab === 'tools'}
                data-tab="tools"
              >
                Art Tools
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="events" className="mt-0" data-testid="events-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Verified Events</h2>
                <div className="text-sm text-muted-foreground">
                  Only showing verified event organizers
                </div>
              </div>
              <EventsList />
            </div>
          </TabsContent>
          
          <TabsContent value="tools" className="mt-0" data-testid="tools-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Verified Tools</h2>
                <div className="text-sm text-muted-foreground">
                  Only showing verified vendors
                </div>
              </div>
              <ToolsMarketplace />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}