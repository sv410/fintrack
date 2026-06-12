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
      {/* Gradient mesh background */}
      <div className="mesh-bg" aria-hidden="true">
        <div className="orb-center" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 w-full">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-3 pb-2">
          <div
            className="flex h-12 items-center justify-between rounded-2xl px-4"
            style={{
              background: "hsl(228 22% 10% / 0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid hsl(225 18% 18% / 0.7)",
              boxShadow: "0 4px 24px -4px hsl(230 25% 6% / 0.8), inset 0 1px 0 hsl(225 18% 24% / 0.3)",
            }}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(160 80% 50%), hsl(160 80% 38%))",
                  boxShadow: "0 0 14px hsl(160 80% 50% / 0.35)",
                }}
              >
                <Zap className="w-3.5 h-3.5 fill-[hsl(230_25%_6%)] text-[hsl(230_25%_6%)]" />
              </div>
              <span
                className="font-display font-bold text-base text-foreground tracking-tight"
              >
                Fintrack
              </span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white/8 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-3.5 h-3.5 transition-colors",
                        isActive ? "text-primary" : ""
                      )}
                    />
                    <span className="hidden sm:inline">{item.label}</span>
                    {isActive && (
                      <span className="hidden sm:block w-1 h-1 rounded-full bg-primary pulse-dot" />
                    )}
                  </Link>
                );
              })}

              <div className="w-px h-4 mx-1.5 bg-white/8 hidden sm:block" />

              <Link href="/add">
                <button
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, hsl(160 80% 50%), hsl(160 80% 42%))",
                    color: "hsl(230 25% 6%)",
                    boxShadow: "0 0 20px hsl(160 80% 50% / 0.25)",
                  }}
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container mx-auto max-w-6xl px-4 sm:px-6 py-8 page-enter">
        {children}
      </main>
    </div>
  );
}
