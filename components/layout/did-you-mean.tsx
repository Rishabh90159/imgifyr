"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ToolMatch } from "@/lib/search/tool-index";

/** On the 404 page: reads the mistyped address as a search ("/tools/50-kb-photo" → "50 kb photo") and offers the best tool. */
export function DidYouMean() {
  const [match, setMatch] = useState<ToolMatch | null>(null);

  useEffect(() => {
    let words = "";
    try {
      words = (decodeURIComponent(window.location.pathname).split("/").filter(Boolean).pop() ?? "").replace(/[-_.+]+/g, " ").trim();
    } catch {
      return;
    }
    if (!words) return;
    let active = true;
    void import("@/lib/search/tool-index").then(({ searchTools }) => {
      if (active) setMatch(searchTools(words, 1)[0] ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!match) return null;
  return (
    <p className="mt-6 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-base text-ink">
      Did you mean{" "}
      <Link href={match.href} className="font-semibold text-accent underline underline-offset-2">
        {match.name}
      </Link>
      ?
    </p>
  );
}
