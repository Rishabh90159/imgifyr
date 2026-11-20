import type { Metadata } from "next";
import Link from "next/link";
import { CompressPdfTool } from "@/components/documents/compress-pdf-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("compress-pdf-to-1mb");

const description =
  "Compress PDF to 1MB for visa, bank, insurance and job portals or email. Reduce a large PDF to under 1 MB in your browser, free and without uploading it.";

export const metadata: Metadata = pageMetadata({
  title: "Compress PDF to 1MB – Reduce PDF Size Under 1 MB Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I reduce a PDF to under 1MB?",
    answer: "Add the file here with 1 MB selected and press Compress. Save it once the result shows a size below 1 MB.",
  },
  {
    question: "Is 1 MB 1,000 KB or 1,024 KB?",
    answer: "This tool counts 1 MB as 1,024 KB, as most upload forms do. If a portal still refuses the file, set a custom target of 950 KB.",
  },
  {
    question: "My phone scan is 8 MB. Can it reach 1 MB?",
    answer:
      "Usually, yes. Phone scans are large photos, and saving each page as a well-compressed JPG removes most of that size while keeping it readable.",
  },
  {
    question: "Can I compress a PDF to 1MB for email?",
    answer: "Yes. A 1 MB PDF attaches easily to any email service and opens quickly on phones.",
  },
  {
    question: "Does my file leave my computer?",
    answer: "No. It's compressed by your browser on your own device; nothing is sent to us.",
  },
];

export default function CompressPdfTo1mbPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Compress PDF to 1MB"
      intro={<p>Turn a large PDF, such as a phone scan or a photo-heavy file, into one under 1 MB for portals and email.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Steps to compress a PDF to 1MB</h2>
          <ol>
            <li>Open the PDF; the 1 MB target is preselected.</li>
            <li>
              Tap <strong>Compress</strong>: re-saving is tried first, page images only if needed.
            </li>
            <li>Download the file once it shows under 1 MB.</li>
          </ol>

          <h2>Visa, bank and job portals</h2>
          <p>
            When a portal allows 1 MB per document, that is usually plenty for bank statements, passport copies and
            multi-page forms. Have photos instead of a PDF? Combine them with <Link href="/tools/photo-to-pdf">photo to PDF</Link>. For a
            stricter limit, use <Link href="/tools/compress-pdf-to-500kb">compress PDF to 500KB</Link> or the{" "}
            <Link href="/tools/compress-pdf">PDF compressor</Link> with your own size.
          </p>

          <PrivacyNote>
            <p>The PDF is compressed locally and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <CompressPdfTool tool="compress-pdf-to-1mb" defaultKB={1024} />
    </ToolPageShell>
  );
}
