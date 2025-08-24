// CoachDrawer - AI learning assistant
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { aiClient } from "@/lib/aiClient";
import { log } from "@/lib/log";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, BookOpen, Image as ImageIcon } from "lucide-react";

interface CoachDrawerProps {
  children: React.ReactNode;
  artworkImageUrl?: string;
}

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  citations?: string[];
  timestamp: Date;
}

export const CoachDrawer = ({ children, artworkImageUrl }: CoachDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // For now, we'll generate mock responses based on the question
      const response = await generateMockResponse(input.trim(), artworkImageUrl);
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response.content,
        citations: response.citations,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      log.info("Coach response generated", { question: input.substring(0, 50) });
    } catch (error) {
      log.error("Failed to get coach response", { error: error.message });
      toast({
        variant: "destructive",
        title: "Coach unavailable",
        description: "The AI coach is temporarily unavailable. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeArtwork = async () => {
    if (!artworkImageUrl) return;

    setIsLoading(true);
    try {
      // Create embedding for the artwork and provide analysis
      await aiClient.embed({ imageUrl: artworkImageUrl });
      
      const analysisMessage: ChatMessage = {
        id: `analysis-${Date.now()}`,
        type: "assistant",
        content: "I can see this is a beautiful piece! The composition shows strong use of color harmony and balanced proportions. The technique appears to emphasize texture and depth. Would you like me to suggest similar techniques you could practice, or discuss the artistic principles demonstrated here?",
        citations: ["Art Composition Handbook", "Color Theory Guide"],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, analysisMessage]);
      log.info("Artwork analyzed", { imageUrl: artworkImageUrl.substring(0, 50) });
    } catch (error) {
      log.error("Failed to analyze artwork", { error: error.message });
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "Failed to analyze the artwork. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            AI Art Coach
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full mt-6">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-medium mb-2">Welcome to your AI Art Coach!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ask me about techniques, get feedback, or learn new skills.
                  </p>
                  {artworkImageUrl && (
                    <Button onClick={analyzeArtwork} variant="outline" size="sm">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Analyze Current Artwork
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <Card className={`max-w-[80%] ${
                      message.type === "user" ? "bg-primary text-primary-foreground" : ""
                    }`}>
                      <CardContent className="p-3">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.citations.map((citation, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {citation}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <Card className="max-w-[80%]">
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Ask about techniques, styles, or get feedback..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Mock response generator for development
async function generateMockResponse(question: string, artworkImageUrl?: string): Promise<{
  content: string;
  citations: string[];
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("watercolor")) {
    return {
      content: "Watercolor is a wonderful medium! Start with quality paper (140lb minimum) and practice wet-on-wet and wet-on-dry techniques. Begin with simple washes and gradually build layers. Remember that watercolor is transparent, so work light to dark. Key tips: use plenty of water, don't overwork the paint, and embrace happy accidents!",
      citations: ["Watercolor Techniques Manual", "Jean Haines Color Guide"],
    };
  }

  if (lowerQuestion.includes("composition")) {
    return {
      content: "Great composition follows the rule of thirds, but don't be afraid to break it! Consider leading lines, balance, and focal points. Create visual hierarchy with contrast, color, and size. Study master paintings to see how they guide the viewer's eye through the piece.",
      citations: ["Art Composition Handbook", "Visual Design Principles"],
    };
  }

  if (lowerQuestion.includes("color")) {
    return {
      content: "Color theory is fundamental! Start with the color wheel: primary, secondary, and tertiary colors. Complementary colors create vibrant contrast, while analogous colors create harmony. Consider temperature (warm vs cool) and value (light vs dark). Practice mixing colors to understand how they interact.",
      citations: ["Color Theory Fundamentals", "Mixing Paint Guide"],
    };
  }

  // Default response
  return {
    content: "That's a great question! Art is all about practice and experimentation. I'd recommend starting with the basics of your chosen medium and gradually building complexity. Don't be afraid to make mistakes - they're often where the best learning happens. What specific aspect would you like to explore further?",
    citations: ["Art Learning Guide", "Creative Process Manual"],
  };
}