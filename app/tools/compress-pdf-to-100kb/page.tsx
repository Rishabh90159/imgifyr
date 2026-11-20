import type { Metadata } from "next";
import Link from "next/link";
import { CompressPdfTool } from "@/components/documents/compress-pdf-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("compress-pdf-to-100kb");

const description =
  "Compress PDF to 100KB for forms with a tight limit: this PDF size reducer shrinks scans and certificates to 100 KB or less in your browser. Free, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Compress PDF to 100KB – Reduce PDF Size to 100KB Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I reduce PDF size to 100KB?",
    answer: "Drop the PDF above; 100 KB is already selected. Select Compress and download the result, which shows its exact size.",
  },
  {
    question: "Why is my PDF still above 100KB?",
    answer:
      "Each page needs some space to stay readable, so long documents can't all fit in 100 KB. Remove pages the form doesn't ask for, or check whether it accepts 200 KB.",
  },
  {
    question: "Will a 100 KB PDF still be readable?",
    answer: "Usually, for one or two pages. Resolution is lowered only as far as needed; zoom in on small print before you upload.",
  },
  {
    question: "Can I compress a PDF to 100KB on my phone?",
    answer: "Yes. The page works in Chrome or Safari on Android and iPhone; pick the PDF from your files or downloads.",
  },
  {
    question: "Is my PDF uploaded anywhere?",
    answer: "No. Compression runs in your browser, so the document never leaves your device.",
  },
];

export default function CompressPdfTo100kbPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Compress PDF to 100KB"
      intro={<p>Shrink a PDF to 100 KB or less, one of the tightest limits upload forms set.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to compress a PDF to 100KB</h2>
          <ol>
            <li>Choose the PDF; the target is already 100 KB.</li>
            <li>
              Select <strong>Compress</strong>. A file already under 100 KB is returned unchanged.
            </li>
            <li>Check the size shown and download.</li>
          </ol>

          <h2>Getting a scan under 100 KB</h2>
          <p>
            Scanned pages are pictures, so they are saved as compact JPG pages at the highest quality that still fits. Keep
            only the pages the form needs: a single certificate fits far more easily than a ten-page file. Need a little more
            room? Try <Link href="/tools/compress-pdf-to-200kb">compress PDF to 200KB</Link>, or set any size in the{" "}
            <Link href="/tools/compress-pdf">PDF compressor</Link>.
          </p>

          <PrivacyNote>
            <p>Your PDF is compressed on your device and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <CompressPdfTool tool="compress-pdf-to-100kb" defaultKB={100} />
    </ToolPageShell>
  );
}
