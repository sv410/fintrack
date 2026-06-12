import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, ArrowLeftRight, Plus, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-6xl flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Zap className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg tracking-tight text-foreground">
              Fintrack
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            <div className="w-px h-5 bg-border mx-2 hidden sm:block" />

            <Link href="/add">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-6xl px-4 sm:px-6 py-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
