"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { ToolMatch } from "@/lib/search/tool-index";

type SearchModule = typeof import("@/lib/search/tool-index");

/**
 * Site search with suggestions as you type, matched on names, descriptions and everyday words, including
 * Hinglish ("photo ka size kam kare") and sizes ("30kb"). The search data loads only when the box is first used,
 * so pages don't carry it. A WAI-ARIA combobox: arrow keys move, Enter opens, Escape closes.
 *
 * Variants: "header" (desktop bar, results float below), "menu" (phone Tools menu, results in the flow),
 * "page" (the All tools page; reads ?q= so a search with no match from elsewhere lands here).
 */
export function ToolSearch({ variant = "header" }: { variant?: "header" | "menu" | "page" }) {
  const router = useRouter();
  const id = useId();
  const inputId = `${id}-input`;
  const listId = `${id}-list`;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [search, setSearch] = useState<SearchModule | null>(null);
  const loading = useRef(false);
  const root = useRef<HTMLFormElement>(null);

  const load = () => {
    if (search || loading.current) return;
    loading.current = true;
    void import("@/lib/search/tool-index").then((module) => setSearch(() => module));
  };

  // The All tools page starts with ?q= when a search elsewhere found no single tool.
  useEffect(() => {
    if (variant !== "page") return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      setQuery(q.slice(0, 80));
      setOpen(true);
      load();
    }
    // Runs once on the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  // Close when tapping or clicking elsewhere.
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const trimmed = query.trim();
  const results: ToolMatch[] = search ? (trimmed ? search.searchTools(trimmed) : search.POPULAR) : [];
  const showList = open && search !== null;
  const highlighted = results[Math.min(active, results.length - 1)];

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    setActive(0);
    router.push(href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (results.length) setActive((current) => (current + (event.key === "ArrowDown" ? 1 : results.length - 1)) % results.length);
    } else if (event.key === "Escape") {
      // First Escape closes the list and keeps the text (the browser would otherwise clear it and reopen the list).
      if (open) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
      }
    }
  };

  const listClass =
    variant === "menu"
      ? "mt-1.5 max-h-[50vh] overflow-y-auto rounded-md border border-line bg-canvas"
      : "absolute inset-x-0 top-full z-50 mt-1.5 max-h-[70vh] overflow-y-auto rounded-lg border border-line bg-canvas shadow-lg";

  return (
    <form
      ref={root}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        // Enter opens the highlighted tool; with no match, the All tools page shows the search.
        if (highlighted) go(highlighted.href);
        else if (trimmed) go(`/tools?q=${encodeURIComponent(trimmed)}`);
      }}
      className={variant === "header" ? "relative w-full" : "relative"}
    >
      <label htmlFor={inputId} className={variant === "page" ? "mb-1.5 block text-sm font-medium text-ink" : "sr-only"}>
        {variant === "page" ? "Find a tool" : "Search tools"}
      </label>
      <input
        id={inputId}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && highlighted ? `${listId}-${results.indexOf(highlighted)}` : undefined}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => {
          load();
          setOpen(true);
        }}
        onPointerDown={load}
        onKeyDown={onKeyDown}
        placeholder={variant === "page" ? "e.g. 50 kb, passport, pdf to jpg" : "Search tools…"}
        autoComplete="off"
        enterKeyHint="search"
        className={`w-full rounded-lg border border-line bg-surface pl-3 pr-10 text-ink placeholder:text-muted focus:border-accent focus:bg-canvas focus:outline-2 focus:outline-offset-0 focus:outline-accent ${
          variant === "page" ? "h-12 text-base" : "h-10 text-sm"
        }`}
      />
      <button
        type="submit"
        aria-label="Search"
        className={`absolute right-1 flex h-8 w-8 items-center justify-center rounded-md text-ink-soft hover:bg-accent-soft hover:text-accent ${
          variant === "page" ? "bottom-2" : "top-1"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {showList ? (
        <div className={listClass}>
          <p className="px-3 pb-1 pt-2.5 text-xs font-medium uppercase tracking-wide text-muted" aria-hidden="true">
            {trimmed ? (results.length ? "Matching tools" : "No match") : "Popular tools"}
          </p>
          <ul id={listId} role="listbox" aria-label={trimmed ? `Tools matching ${trimmed}` : "Popular tools"} className="pb-1.5">
            {results.map((result, index) => (
              <li
                key={result.href}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={result === highlighted}
                // Keep focus in the box until the choice is made.
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => go(result.href)}
                onPointerMove={() => setActive(index)}
                className={`mx-1.5 cursor-pointer rounded-md px-2.5 py-2 ${result === highlighted ? "bg-accent-soft" : ""}`}
              >
                <span className="block text-sm font-medium text-ink">{result.name}</span>
                <span className="mt-0.5 line-clamp-1 text-xs text-muted">{result.summary}</span>
              </li>
            ))}
          </ul>
          {trimmed && !results.length ? (
            <p className="px-3 pb-3 text-sm text-ink-soft">
              Nothing matches &ldquo;{trimmed}&rdquo;.{" "}
              <a href="/tools" className="font-medium text-accent underline">
                See all tools
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
