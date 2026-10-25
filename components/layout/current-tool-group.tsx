"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * In the mobile tools menu, marks the link to the current page and opens its category, so the
 * menu starts where the visitor already is. Renders nothing; the menu itself stays server-rendered.
 */
export function CurrentToolGroup() {
  const ref = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const nav = ref.current?.closest("[data-mobile-tools]");
    if (!nav) return;
    nav.querySelectorAll("a[aria-current]").forEach((a) => a.removeAttribute("aria-current"));
    const link = nav.querySelector<HTMLAnchorElement>(`details a[href="${pathname}"]`);
    if (!link) return;
    link.setAttribute("aria-current", "page");
    const group = link.closest("details");
    if (group) group.open = true;
  }, [pathname]);

  return <span ref={ref} hidden />;
}
