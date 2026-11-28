import type { Metadata } from "next";
import Link from "next/link";
import { CompressPdfTool } from "@/components/documents/compress-pdf-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("compress-pdf-to-50kb");

const description =
  "Compress PDF to 50KB for the strictest upload forms: shrink a one-page certificate or ID scan below 50 KB in your browser. Free, with no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Compress PDF to 50KB – Reduce PDF Size Below 50 KB, Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How can I compress a PDF to 50KB?",
    answer: "Choose the PDF here; 50 KB is preselected. Press Compress, then download once the result shows 50 KB or less.",
  },
  {
    question: "Why won't my PDF go below 50 KB?",
    answer:
      "50 KB is roughly one scanned page at a readable resolution. Split out the single page the form needs, or crop the scan tightly before making the PDF.",
  },
  {
    question: "Will the text still be readable?",
    answer: "For a single A4 certificate, usually yes. Zoom in on small print and stamps before you upload.",
  },
  {
    question: "Can a form ask for 50 KB to 100 KB?",
    answer: "Yes, some do. Use the custom size to aim for about 90 KB, which keeps more detail while staying in range.",
  },
  {
    question: "Is the PDF uploaded?",
    answer: "No. It's compressed in your browser, on your own phone or computer.",
  },
];

export default function CompressPdfTo50kbPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Compress PDF to 50KB"
      intro={<p>Squeeze a one-page PDF, like a certificate, ID card or photo copy, under a 50 KB upload limit.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make a PDF under 50 KB</h2>
          <ol>
            <li>Select your PDF; 50 KB is already the target.</li>
            <li>
              Tap <strong>Compress</strong>. Each page is saved as a compact image if that is what it takes.
            </li>
            <li>Read the size on the result and download.</li>
          </ol>

          <h2>Tips for a tight 50 KB limit</h2>
          <ul>
            <li>Keep one page: every extra page shares the same 50 KB.</li>
            <li>Scan in black and white or greyscale where the form allows it; colour costs more space.</li>
            <li>
              Crop away table and background first with the <Link href="/tools/document-scanner">document scanner</Link>.
            </li>
          </ul>
          <p>
            If 100 KB is allowed, <Link href="/tools/compress-pdf-to-100kb">compress PDF to 100KB</Link> keeps sharper text.
          </p>

          <PrivacyNote>
            <p>Compression happens on your device; your document is not uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <CompressPdfTool tool="compress-pdf-to-50kb" defaultKB={50} />
    </ToolPageShell>
  );
}
