"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";

const VARIANTS = ["A", "B", "C"];

export function PrototypeSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentVariant = searchParams.get("variant") || "A";

  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        const nextIndex = (VARIANTS.indexOf(currentVariant) + 1) % VARIANTS.length;
        router.push(`${pathname}?variant=${VARIANTS[nextIndex]}`);
      } else if (e.key === "ArrowLeft") {
        const prevIndex = (VARIANTS.indexOf(currentVariant) - 1 + VARIANTS.length) % VARIANTS.length;
        router.push(`${pathname}?variant=${VARIANTS[prevIndex]}`);
      }
    },
    [currentVariant, pathname, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleKeydown]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-surface/80 backdrop-blur-md shadow-glass border border-white/10 p-2 flex items-center gap-2">
      <div className="px-3 text-xs font-sans text-secondary/50 uppercase tracking-widest border-r border-white/10">
        PROTOTYPE
      </div>
      {VARIANTS.map((v) => (
        <button
          key={v}
          onClick={() => router.push(`${pathname}?variant=${v}`)}
          className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
            currentVariant === v
              ? "bg-primary text-background"
              : "text-secondary hover:bg-white/10"
          }`}
        >
          {v}
        </button>
      ))}
      <div className="px-3 text-[10px] font-sans text-secondary/40 uppercase tracking-widest border-l border-white/10 hidden sm:block">
        Use Arrow Keys
      </div>
    </div>
  );
}
