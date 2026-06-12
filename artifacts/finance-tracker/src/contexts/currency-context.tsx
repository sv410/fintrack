import { createContext, useContext, useState, ReactNode } from "react";

export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", label: "US Dollar",        symbol: "$",  locale: "en-US" },
  { code: "INR", label: "Indian Rupee",     symbol: "₹",  locale: "en-IN" },
  { code: "EUR", label: "Euro",             symbol: "€",  locale: "de-DE" },
  { code: "GBP", label: "British Pound",    symbol: "£",  locale: "en-GB" },
  { code: "JPY", label: "Japanese Yen",     symbol: "¥",  locale: "ja-JP" },
  { code: "AUD", label: "Australian Dollar",symbol: "A$", locale: "en-AU" },
  { code: "CAD", label: "Canadian Dollar",  symbol: "C$", locale: "en-CA" },
  { code: "CHF", label: "Swiss Franc",      symbol: "Fr", locale: "de-CH" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$", locale: "en-SG" },
  { code: "AED", label: "UAE Dirham",       symbol: "د.إ",locale: "ar-AE" },
];

interface CurrencyContextValue {
  currency: CurrencyOption;
  setCurrency: (c: CurrencyOption) => void;
  format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function loadSaved(): CurrencyOption {
  try {
    const saved = localStorage.getItem("fintrack_currency");
    if (saved) {
      const found = CURRENCIES.find(c => c.code === saved);
      if (found) return found;
    }
  } catch {}
  return CURRENCIES[0];
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyOption>(loadSaved);

  function setCurrency(c: CurrencyOption) {
    setCurrencyState(c);
    try { localStorage.setItem("fintrack_currency", c.code); } catch {}
  }

  function format(amount: number) {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: currency.code === "JPY" ? 0 : 2,
    }).format(amount);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
