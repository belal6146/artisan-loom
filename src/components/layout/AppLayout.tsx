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
    <div className="min-h-dvh bg-brand-radial bg-noise/20">
      <Header />
      <main className="mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-8 py-6">
        {children}
      </main>
      {showFooter && <Footer />}
      <Toaster />
      <ConsentBanner />
    </div>
  );
};