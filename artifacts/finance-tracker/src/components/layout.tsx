import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, ArrowLeftRight, Plus, Zap, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency, CURRENCIES } from "@/contexts/currency-context";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(160 80% 50%), hsl(160 80% 38%))",
                  boxShadow: "0 0 14px hsl(160 80% 50% / 0.35)",
                }}
              >
                <Zap className="w-3.5 h-3.5 fill-[hsl(230_25%_6%)] text-[hsl(230_25%_6%)]" />
              </div>
              <span className="font-display font-bold text-base text-foreground tracking-tight">
                Fintrack
              </span>
            </Link>

            {/* Right side */}
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
                    <item.icon className={cn("w-3.5 h-3.5", isActive ? "text-primary" : "")} />
                    <span className="hidden sm:inline">{item.label}</span>
                    {isActive && (
                      <span className="hidden sm:block w-1 h-1 rounded-full bg-primary pulse-dot" />
                    )}
                  </Link>
                );
              })}

              <div className="w-px h-4 mx-1 bg-white/8 hidden sm:block" />

              {/* Currency picker */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setOpen(v => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-white/5"
                  style={{ color: "hsl(215 20% 60%)", border: "1px solid hsl(225 18% 18%)" }}
                >
                  <span>{currency.symbol}</span>
                  <span className="hidden sm:inline">{currency.code}</span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", open ? "rotate-180" : "")} />
                </button>

                {open && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50"
                    style={{
                      background: "hsl(228 22% 11%)",
                      border: "1px solid hsl(225 18% 20%)",
                      boxShadow: "0 16px 48px hsl(230 25% 4% / 0.8)",
                    }}
                  >
                    <div className="p-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                        Select currency
                      </p>
                      {CURRENCIES.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setCurrency(c); setOpen(false); }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-all duration-100"
                          style={
                            currency.code === c.code
                              ? { background: "hsl(160 80% 50% / 0.1)", color: "hsl(160 80% 55%)" }
                              : { color: "hsl(210 40% 80%)" }
                          }
                          onMouseEnter={e => {
                            if (currency.code !== c.code)
                              (e.currentTarget as HTMLElement).style.background = "hsl(225 18% 16%)";
                          }}
                          onMouseLeave={e => {
                            if (currency.code !== c.code)
                              (e.currentTarget as HTMLElement).style.background = "transparent";
                          }}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="w-5 text-center font-mono text-xs">{c.symbol}</span>
                            <span className="font-medium">{c.label}</span>
                          </span>
                          {currency.code === c.code && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-px h-4 mx-1 bg-white/8 hidden sm:block" />

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
