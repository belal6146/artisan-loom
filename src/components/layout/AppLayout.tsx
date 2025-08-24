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
    <div className="min-h-dvh bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(120,120,255,.08),transparent)]">
      <Header />
      <main className="container mx-auto px-4 md:px-6 xl:px-8 max-w-7xl">
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