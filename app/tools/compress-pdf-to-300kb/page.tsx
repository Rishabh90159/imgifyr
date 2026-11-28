import type { Metadata } from "next";
import Link from "next/link";
import { CompressPdfTool } from "@/components/documents/compress-pdf-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("compress-pdf-to-300kb");

const description =
  "Compress PDF to 300KB online free: a PDF size reducer for 300 KB upload limits that keeps text sharp where it can. Works in your browser, nothing uploaded.";

export const metadata: Metadata = pageMetadata({
  title: "Compress PDF to 300KB Online Free – PDF Size Reducer 300 KB",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I compress a PDF to 300KB?",
    answer: "Open your PDF on this page, where 300 KB is already chosen, and press Compress. Download it when the new size reads 300 KB or less.",
  },
  {
    question: "Can I reduce PDF size to 300KB without losing quality?",
    answer:
      "Often, yes. The file is first re-saved without touching text or images; pages are turned into images only when that is the only way to reach 300 KB.",
  },
  {
    question: "How many pages fit in 300 KB?",
    answer: "A few scanned pages usually fit, and many more pages of typed text. Very long scans may need pages removed.",
  },
  {
    question: "Does it work on a phone?",
    answer: "Yes, in Chrome on Android and Safari on iPhone. Pick the PDF from Files or Downloads.",
  },
  {
    question: "Is my PDF sent anywhere?",
    answer: "No. Your browser does the compression on your device; the file is never uploaded.",
  },
];

export default function CompressPdfTo300kbPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Compress PDF to 300KB"
      intro={<p>Get a PDF under 300 KB, a common limit for documents on job, admission and scholarship forms.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Reduce a PDF to 300 KB</h2>
          <ol>
            <li>Add the PDF; the target starts at 300 KB.</li>
            <li>
              Select <strong>Compress</strong> and wait for the result card.
            </li>
            <li>Check that it reads 300 KB or less, then save it.</li>
          </ol>

          <h2>When 300 KB is the limit</h2>
          <p>
            300 KB leaves room for a short scanned document, such as a caste or income certificate, to stay clearly readable.
            Is the form stricter? Try <Link href="/tools/compress-pdf-to-200kb">compress PDF to 200KB</Link>. Starting from
            photos? Build the PDF at a set size with <Link href="/tools/photo-to-pdf-in-kb">photo to PDF in KB</Link>.
          </p>

          <PrivacyNote>
            <p>The PDF never leaves your device while it is made smaller.</p>
          </PrivacyNote>
        </>
      }
    >
      <CompressPdfTool tool="compress-pdf-to-300kb" defaultKB={300} />
    </ToolPageShell>
  );
}
