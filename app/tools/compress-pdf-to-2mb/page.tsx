import type { Metadata } from "next";
import Link from "next/link";
import { CompressPdfTool } from "@/components/documents/compress-pdf-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("compress-pdf-to-2mb");

const description =
  "Compress PDF to 2MB free: reduce PDF size to 2 MB online for long scans, project reports and multi-page applications, in your browser with no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Compress PDF to 2MB Free – Reduce PDF Size to 2 MB Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I reduce PDF size to 2MB?",
    answer: "Add the file with 2 MB already set and press Compress. Save the PDF when the result is 2 MB or smaller.",
  },
  {
    question: "My PDF is 20 MB. Can it get to 2 MB?",
    answer:
      "Usually. Large PDFs are mostly high-resolution photos of pages, and those shrink a lot when saved as well-compressed page images.",
  },
  {
    question: "Will a 2 MB PDF keep good quality?",
    answer: "Yes for most documents: 2 MB is generous, so pages keep a high resolution and small print stays crisp.",
  },
  {
    question: "How large a PDF can I add?",
    answer: "The limit is shown on the upload box. Bigger files take longer, so keep this tab open until it finishes.",
  },
  {
    question: "Does the PDF leave my device?",
    answer: "No. Everything runs in your browser and nothing is uploaded to a server.",
  },
];

export default function CompressPdfTo2mbPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Compress PDF to 2MB"
      intro={<p>Reduce a long or photo-heavy PDF to 2 MB or less, for portals that allow bigger files but still cap the size.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Steps for a 2 MB PDF</h2>
          <ol>
            <li>Choose the PDF; the tool opens at 2 MB.</li>
            <li>
              Press <strong>Compress</strong>. A PDF already under 2 MB comes back untouched.
            </li>
            <li>Confirm the new size and download it.</li>
          </ol>

          <h2>Long documents and reports</h2>
          <p>
            A 2 MB cap suits a full project report, a thesis chapter or several certificates merged into one file. Joining
            files first? Use <Link href="/tools/merge-pdf">Merge PDF</Link>, then compress the combined file. Need it smaller
            for email? <Link href="/tools/compress-pdf-to-1mb">Compress PDF to 1MB</Link>.
          </p>

          <PrivacyNote>
            <p>The file is reduced locally in your browser and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <CompressPdfTool tool="compress-pdf-to-2mb" defaultKB={2048} />
    </ToolPageShell>
  );
}
