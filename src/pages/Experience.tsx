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

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-b border-border">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">Experience</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Discover art events, workshops, and curated tools from trusted vendors.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-8" aria-label="Experience sections">
              <TabsTrigger 
                value="events" 
                className="text-base"
                aria-selected={activeTab === 'events'}
              >
                Events
              </TabsTrigger>
              <TabsTrigger 
                value="tools" 
                className="text-base"
                aria-selected={activeTab === 'tools'}
              >
                Art Tools
              </TabsTrigger>
            </TabsList>
            
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