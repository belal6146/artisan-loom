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
    <div className="min-h-dvh bg-app">
      <Header />
      <main className="container mx-auto max-w-7xl">
        <div className="grid gap-6 md:gap-8 xl:grid-cols-12">
          {children}
        </div>
      </main>
      {showFooter && <Footer />}
      <Toaster />
      <ConsentBanner />
    </div>
  );
};