"use client";

import { useId } from "react";

/**
 * Picks one notice from a short list, as radio buttons whose labels wrap. Used instead of a <select>: a browser's
 * open dropdown list is as wide as its longest option and can't be narrowed, so long notice names ran off narrow
 * screens. Native radios keep keyboard and screen-reader support.
 */
export function NoticeChoice({
  legend,
  hideLegend = false,
  options,
  value,
  onChange,
}: {
  legend: string;
  hideLegend?: boolean;
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  const name = useId();
  return (
    <fieldset className="min-w-0">
      <legend className={hideLegend ? "sr-only" : "text-sm font-medium text-ink"}>{legend}</legend>
      <div className={`${hideLegend ? "" : "mt-1.5 "}space-y-1`}>
        {options.map((o) => (
          <label
            key={o.id}
            className={`flex min-h-10 cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 text-sm leading-snug break-words has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
              o.id === value ? "border-accent bg-accent-soft text-ink" : "border-line bg-canvas text-ink-soft hover:bg-surface"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.id}
              checked={o.id === value}
              onChange={() => onChange(o.id)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
            />
            <span className="min-w-0">{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
