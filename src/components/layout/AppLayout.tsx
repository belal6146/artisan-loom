import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/toaster";
import { ConsentBanner } from "@/components/privacy/ConsentBanner";

interface AppLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export const AppLayout = ({ children, showFooter = true }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(0,0,0,0.04),transparent)]">
      <Header />
      <main className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      {showFooter && <Footer />}
      <Toaster />
      <ConsentBanner />
    </div>
  );
};