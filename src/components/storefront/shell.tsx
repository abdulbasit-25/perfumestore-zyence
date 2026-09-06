import type { ReactNode } from "react";
import { ChatbotWidget } from "./chatbot";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <SiteFooter />
      <ChatbotWidget />
    </div>
  );
}
