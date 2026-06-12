import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { PlusCircle, Home, List, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/transactions", label: "Transactions", icon: List },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-5xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group transition-transform">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-serif font-semibold text-xl tracking-tight text-foreground">
              Fintrack
            </span>
          </Link>
          <nav className="flex items-center gap-1 md:gap-4">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline-block">{item.label}</span>
                </Link>
              );
            })}
            <div className="w-px h-6 bg-border mx-1 md:mx-2 hidden sm:block"></div>
            <Link href="/add">
              <Button size="sm" className="gap-2 rounded-full font-medium">
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline-block">Add Entry</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>
    </div>
  );
}
