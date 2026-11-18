import type { ReactNode } from "react";
import { todayInIndia } from "@/lib/requirements/open-applications";

/**
 * Shows an application-date passage only until the window closes (`closes`: ISO date, India time). Pages that use it
 * export `revalidate = 86400`, so the passage drops by itself the day after closing and no stale date stays live.
 */
export function WhileOpen({ closes, children }: { closes: string; children: ReactNode }) {
  return todayInIndia() <= closes ? <>{children}</> : null;
}
