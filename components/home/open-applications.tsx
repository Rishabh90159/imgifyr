import Link from "next/link";
import { openApplications } from "@/lib/requirements/open-applications";
import { formatVerifiedDate } from "@/lib/requirements/types";
import { getTool } from "@/lib/tools/registry";

/**
 * "Applications open now": links to the exam pages whose application window hasn't closed.
 * Server-rendered and renders nothing once every listed window is over.
 */
export function OpenApplications({ className = "" }: { className?: string }) {
  const open = openApplications();
  if (open.length === 0) return null;
  return (
    <section aria-labelledby="open-applications-heading" className={className}>
      <div className="rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">
        <h2 id="open-applications-heading" className="flex items-center gap-2 text-lg font-bold text-ink">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-success" />
          Applications open now
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {open.map((item) => (
            <li key={item.exam}>
              <Link
                href={getTool(item.tool).path}
                className="group flex min-h-11 h-full flex-col justify-center rounded-md border border-line px-3 py-2 hover:border-accent/50"
              >
                <span className="text-sm font-semibold text-ink group-hover:text-accent">{item.exam}</span>
                <span className="text-xs text-muted">
                  Apply by <time dateTime={item.closes}>{formatVerifiedDate(item.closes)}</time> · photo and signature sizes
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
