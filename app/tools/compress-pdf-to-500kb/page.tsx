import type { Metadata } from "next";
import Link from "next/link";
import { CompressPdfTool } from "@/components/documents/compress-pdf-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("compress-pdf-to-500kb");

const description =
  "Compress PDF to 500KB for multi-page documents: resumes, project reports and application packs. Reduce PDF size to 500KB online, free, without uploading.";

export const metadata: Metadata = pageMetadata({
  title: "Compress PDF to 500KB – Reduce Multi-Page PDF Size Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I compress a PDF to 500KB?",
    answer: "Load the file; the 500 KB target is ready. Choose Compress, then download once the new size appears.",
  },
  {
    question: "Will my resume's text stay selectable at 500 KB?",
    answer:
      "Usually yes. A resume made in Word or Google Docs is mostly text, so re-saving often fits it without turning pages into images. The result tells you which method was used.",
  },
  {
    question: "How many pages fit in 500 KB?",
    answer:
      "It depends on the content. Text pages are tiny; full-page scans and photos take most of the space. The tool lowers image resolution only as much as the target needs.",
  },
  {
    question: "Can I combine several PDFs into one 500 KB file?",
    answer: "Yes: merge them with the PDF merger, then compress the merged file to 500 KB here.",
  },
  {
    question: "Is this PDF compressor free and private?",
    answer: "Yes. There's no sign-up or watermark, and the file is handled entirely by your browser.",
  },
];

export default function CompressPdfTo500kbPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Compress PDF to 500KB"
      intro={<p>Fit resumes, reports and multi-page applications under 500 KB without making them hard to read.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Reduce PDF size to 500KB</h2>
          <ol>
            <li>Select the PDF; 500 KB is the starting target.</li>
            <li>
              Choose <strong>Compress</strong>. Text-heavy files are re-saved first, so they stay sharp.
            </li>
            <li>Download when the size is under 500 KB.</li>
          </ol>

          <h2>Resumes, reports and longer documents</h2>
          <p>
            Big files are usually big because of photos or scanned pages, not text. Writing the document yourself? Export it
            with <Link href="/tools/word-to-pdf">Word to PDF</Link> rather than scanning a printout, and it may fit without
            compression. For a smaller cap, use <Link href="/tools/compress-pdf-to-200kb">compress PDF to 200KB</Link>.
          </p>

          <PrivacyNote>
            <p>Nothing is uploaded: the PDF is compressed by your browser.</p>
          </PrivacyNote>
        </>
      }
    >
      <CompressPdfTool tool="compress-pdf-to-500kb" defaultKB={500} />
    </ToolPageShell>
  );
}
