import { OPEN_APPLICATIONS, todayInIndia } from "@/lib/requirements/open-applications";

/** The ISO date after `iso`. */
function dayAfter(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Last-modified date for a page whose text changes by itself when an application window closes (the homepage and
 * hub "open now" lists, and the date passages on exam pages, drop the day after closing). It is the later of the
 * page's own `updated` date and the most recent day a listed window dropped off, up to `today`.
 * `tool` limits it to one exam page's windows; without it, every window counts.
 */
export function lastModified(updated: string, tool?: string, today = todayInIndia()): string {
  const dropped = OPEN_APPLICATIONS.filter((a) => !tool || a.tool === tool)
    .map((a) => dayAfter(a.closes))
    .filter((d) => d <= today);
  return [updated, ...dropped].sort().at(-1)!;
}
