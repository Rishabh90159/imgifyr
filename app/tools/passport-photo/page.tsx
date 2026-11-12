import type { Metadata } from "next";
import Link from "next/link";
import { SourceLink } from "@/components/requirements/source-link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { PASSPORT_NOT_VERIFIED, PASSPORT_REQUIREMENTS } from "@/lib/requirements/passports";
import { formatKbRange, formatVerifiedDate } from "@/lib/requirements/types";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("passport-photo");

const description =
  "Passport size photo requirements by country from official government sources, printed and digital, plus a free maker that crops your photo to size.";

export const metadata: Metadata = pageMetadata({
  title: "Passport Size Photo Maker – Official Sizes by Country",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the passport photo size?",
    answer:
      "It depends on the country and on printed versus digital. India and the UK use 35 × 45 mm printed photos and Canada 50 × 70 mm, while online applications set minimum pixel sizes and file-size ranges instead.",
  },
  {
    question: "What is a passport size photo in pixels?",
    answer:
      "At 300 DPI, a 35 × 45 mm photo (India, UK) is 413 × 531 pixels and Canada's 50 × 70 mm is 591 × 827. Online applications give pixels directly, such as at least 600 × 750 for a UK digital photo.",
  },
  {
    question: "Do I need a photo for an Indian passport application?",
    answer:
      "Not at a Passport Seva Kendra (PSK) or Post Office Passport Seva Kendra (POPSK), where it's taken for you. Other collection centres (DPC, SPC or CSC) need a printed 4.5 cm × 3.5 cm colour photo with a plain white background.",
  },
  {
    question: "Can I print a passport photo at home?",
    answer:
      "Check your country's rules: India's instruction booklet says computer prints won't be accepted and photo paper should be used. A photo lab print of the 4 × 6 in sheet at 100% scale is the safest option.",
  },
  {
    question: "What's the difference between this page and the passport photo resizer?",
    answer:
      "This page starts from verified country requirements, each with its official source. The passport photo resizer is for any size you already know, including custom millimetre or pixel sizes and file limits.",
  },
  {
    question: "Will a photo made here be accepted?",
    answer:
      "The tool sets size, file type and file size. Officials also check pose, lighting, expression, background and recency, so verify the final image against the official requirements before submitting.",
  },
];

function PassportComparison() {
  return (
    <section aria-labelledby="requirements-heading" className="rounded-lg border border-line bg-canvas p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 id="requirements-heading" className="text-lg font-bold text-ink">
          Verified passport photo requirements
        </h2>
        <a
          href="#prepare"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Make your photo now
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M7 2v9M3 7.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
      <p className="mt-1 text-sm text-muted">
        Each row is copied from the government source shown, on the date shown. Pixel sizes for printed photos are our
        conversion at 300 DPI, the usual photo-print resolution.
      </p>
      <div className="relative mt-3 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">Passport photo requirements by country and application</caption>
          <thead>
            <tr className="border-b border-line text-muted">
              <th scope="col" className="py-2 pr-3 font-medium">Country and photo type</th>
              <th scope="col" className="py-2 pr-3 font-medium">Size</th>
              <th scope="col" className="py-2 pr-3 font-medium">File size</th>
              <th scope="col" className="py-2 font-medium">Source</th>
            </tr>
          </thead>
          <tbody className="text-ink-soft">
            {PASSPORT_REQUIREMENTS.map((set) => {
              const photo = set.photo!;
              return (
                <tr key={set.id} className="border-b border-line align-top last:border-0">
                  <th scope="row" className="py-2.5 pr-3 font-medium text-ink">
                    {set.group}
                    <span className="block font-normal text-ink-soft">{set.name}</span>
                  </th>
                  <td className="py-2.5 pr-3 tabular-nums">
                    {photo.physical ?? (photo.pixelBasis === "minimum" ? `at least ${photo.widthPx} × ${photo.heightPx} px` : `${photo.widthPx} × ${photo.heightPx} px`)}
                    {photo.physical && photo.pixelBasis === "derived" && photo.dpi ? (
                      <span className="block text-xs text-muted">
                        = {photo.widthPx} × {photo.heightPx} px at {photo.dpi} DPI
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2.5 pr-3 tabular-nums">{formatKbRange(photo) ?? "Not stated"}</td>
                  <td className="py-2.5">
                    <SourceLink href={set.source.url} preset={set.id}>
                      {set.source.title}
                    </SourceLink>
                    <span className="block text-xs text-muted">
                      Verified <time dateTime={set.source.lastVerified}>{formatVerifiedDate(set.source.lastVerified)}</time>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Collapsed so the tool stays near the top on phones; the text stays in the page. */}
      <details className="group mt-4 rounded-md border border-line">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
          <h3 className="font-medium">Not yet verified: {PASSPORT_NOT_VERIFIED.map((item) => item.country).join(", ")}</h3>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180">
            <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </summary>
        <ul className="space-y-2 border-t border-line px-3 py-3 text-sm text-ink-soft">
          {PASSPORT_NOT_VERIFIED.map((item) => (
            <li key={item.country}>
              <strong className="text-ink">{item.country}:</strong> {item.reason} Official page:{" "}
              <SourceLink href={item.url} preset={`passport-${item.country.toLowerCase().replace(/\s+/g, "-")}-unverified`}>
                {item.label}
              </SourceLink>{" "}
              <span className="text-muted">(checked {formatVerifiedDate(item.checkedOn)})</span>
            </li>
          ))}
        </ul>
      </details>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        <strong className="text-ink-soft">Important:</strong> Application requirements can change. Always verify the final image
        against the latest official notification or application portal before submitting. This is an independent tool and is
        not affiliated with any government.
      </p>
    </section>
  );
}

export default function PassportPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Passport Size Photo: Official Sizes by Country"
      intro={
        <p>
          A passport size photo isn&apos;t one size: every country sets its own, often in pixels and KB for online
          applications. Compare officially verified requirements, then make a matching photo that never leaves your device.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to use the passport size photo maker</h2>
          <ol>
            <li>Pick your country, then printed photo or online application, and check the official source if unsure.</li>
            <li>Add a photo taken against a plain background in even light, and frame your head with the crop box.</li>
            <li>Create the photo; the checklist confirms pixel size and file size.</li>
            <li>For printed photos, have the JPG printed at a photo lab at 100% scale, on photo paper.</li>
          </ol>

          <h2>Passport photo size: printed vs digital</h2>
          <p>
            <strong>Printed photos</strong> are set in millimetres; the tool converts them to pixels at 300 DPI and stores that
            in the JPG, so 35 × 45 mm prints at 35 × 45 mm at actual size. <strong>Digital photos</strong> are set in pixels
            and file size: the UK asks for at least 600 × 750 pixels and 50 KB–10 MB, Canada for a 3:2 portrait JPEG of at least
            1,200 × 1,800 pixels and 200 KB–5 MB.
          </p>
          <p>
            <strong>Print sheet:</strong> 8 photos of 35 × 45 mm fit on 4 × 6 in photo paper, or 30 on A4; Canada&apos;s 50 ×
            70 mm photos fit 2 per 4 × 6 in sheet, or 12 on A4. Print at 100%, not &ldquo;fit to page&rdquo;.
          </p>

          <h2>Country notes</h2>
          <ul>
            <li>
              <strong>India:</strong> no photo is needed at a Passport Seva Kendra or Post Office Passport Seva Kendra; other
              centres need a printed colour photo on plain white, not a computer print.
            </li>
            <li>
              <strong>United Kingdom:</strong> digital photos must be &ldquo;unaltered by computer software&rdquo;; this tool
              only crops and resizes.
            </li>
            <li>
              <strong>Canada:</strong> head (chin to crown) 31–36 mm on printed photos, or 45–50% of the height on digital
              ones.
            </li>
          </ul>

          <h2>Exam photos, signatures and other sizes</h2>
          <p>
            Applying for an exam or a job? See the <Link href="/tools/application-photos">exam photo and signature
            requirements</Link> for IBPS, SBI, SSC, NEET and UPSC, and use the{" "}
            <Link href="/tools/signature-resizer">signature resizer</Link> for the signature. For a size you already know, use
            the <Link href="/tools/passport-photo-resizer">passport photo resizer</Link>; to hit a KB limit, use{" "}
            <Link href="/tools/resize-image-to-kb">resize image to KB</Link>.
          </p>

          <PrivacyNote>
            <p>Passport photos are identity documents. Yours is processed in your browser and never uploaded or stored.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <PassportComparison />
        <RequirementPhotoTool
          tool="passport-photo"
          sets={PASSPORT_REQUIREMENTS}
          groupLabel="Country"
          setLabel="Application"
          appName="passport"
        />
      </div>
    </ToolPageShell>
  );
}
