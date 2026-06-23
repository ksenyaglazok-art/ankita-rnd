import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 pb-8">
      <h1 className="font-display text-4xl md:text-6xl font-black neon-text-pink uppercase tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl font-body">{subtitle}</p>
      )}
      <div className="mt-6 h-px w-32 bg-gradient-to-r from-[#ff2bd6] to-transparent" />
    </section>
  );
}
