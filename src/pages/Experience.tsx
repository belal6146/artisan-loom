import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventsList, ToolsMarketplace } from "@/features/experience/ExperienceModules";
import { Calendar } from "lucide-react";

type ExperienceTab = 'events' | 'tools';

interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  url: string;
  verified?: boolean;
  verdict?: string;
}

// Move ALLOW outside component to avoid dependency issues
const ALLOW = new Set<string>(['meetup.com','eventbrite.com','github.com','figma.com','adobe.com']);

export default function Experience() {
  const [activeTab, setActiveTab] = useState<ExperienceTab>('events');
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Mock data for now - in real app this would fetch from API
    const mockItems: ExperienceItem[] = [
      {
        id: '1',
        title: 'Design Workshop',
        description: 'Learn advanced design techniques',
        url: 'https://meetup.com/design-workshop',
        verified: true,
        verdict: 'ok'
      }
    ];
    
    const items = mockItems
      .filter(i => i?.verdict === 'ok')
      .filter(i => { 
        try { 
          const u = new URL(i.url); 
          return ALLOW.has(u.hostname.replace(/^www\./,'')); 
        } catch { 
          return false; 
        }
      });
    setItems(items);
    setLoading(false);
  }, []); // Now no dependency warning since ALLOW is outside component

  return (
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
            <div className="space-y-4">
              {items.filter(i => i.verified).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {item.title}
                        {item.verified && <span className="ml-2 text-sm text-muted-foreground">Verified</span>}
                      </a>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
  );
}