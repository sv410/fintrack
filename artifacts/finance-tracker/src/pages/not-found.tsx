import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "hsl(0 75% 58% / 0.1)", border: "1px solid hsl(0 75% 58% / 0.2)" }}
      >
        <AlertCircle className="w-7 h-7 text-expense" />
      </div>

      <h1 className="text-4xl font-display font-extrabold text-foreground mb-2">404</h1>
      <p className="text-lg font-semibold text-foreground mb-1">Page not found</p>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">
        The page you're looking for doesn't exist or was moved.
      </p>

      <Link href="/">
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, hsl(160 80% 50%), hsl(160 80% 42%))",
            color: "hsl(230 25% 6%)",
            boxShadow: "0 0 20px hsl(160 80% 50% / 0.25)",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </Link>
    </div>
  );
}
