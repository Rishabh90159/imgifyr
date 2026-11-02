import type { Metadata } from "next";
import Link from "next/link";
import { PdfToJpgTool } from "@/components/documents/pdf-to-jpg-tool";
import { ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { DOC_LIMITS } from "@/lib/documents/validate";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";
import { formatBytes } from "@/lib/utils/format";

const tool = getTool("pdf-to-png");

const description =
  "Convert PDF to PNG online, free: each page becomes a sharp, lossless PNG at 72, 150 or 300 DPI, as one image or a ZIP of pages. In your browser, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "PDF to PNG Converter – Convert PDF Pages to PNG Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Can I convert a PDF with many pages to PNG?",
    answer: `Yes, up to ${DOC_LIMITS.pdfToJpgMaxPages} pages. A single-page PDF gives one PNG; longer ones give a ZIP with one PNG per page, numbered in order.`,
  },
  {
    question: "Why choose PNG instead of JPG for PDF pages?",
    answer:
      "PNG keeps text, lines and charts perfectly sharp, with none of the faint blotches JPG compression can leave around letters. JPG gives smaller files for scanned photos.",
  },
  {
    question: "Will the PNG have a transparent background?",
    answer: "No. Pages are drawn the way a PDF reader shows them, on a white page, so the PNG has a solid white background.",
  },
  {
    question: "Can I keep each PNG under a KB limit?",
    answer:
      "Not with PNG, which is lossless. If a form sets a size limit, use PDF to JPG, which can keep every page under 50, 100, 200 or 500 KB.",
  },
  {
    question: "What about password-protected PDFs?",
    answer: "A PDF that needs a password to open must be unlocked in a PDF reader first; then convert the saved copy.",
  },
  {
    question: "Is my PDF uploaded?",
    answer: "No. Every page is drawn and saved as PNG inside your browser.",
  },
];

export default function PdfToPngPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="PDF to PNG Converter"
      intro={
        <p>
          Save each page of a PDF as a PNG image with crisp text and lines, at screen or print resolution. Nothing is
          uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert PDF to PNG</h2>
          <ol>
            <li>Choose or drop a PDF, up to {formatBytes(DOC_LIMITS.pdfToJpgMaxBytes)}.</li>
            <li>Pick 72, 150 or 300 DPI.</li>
            <li>
              Select <strong>Convert to PNG</strong>, then download the PNG, or the ZIP of every page.
            </li>
          </ol>

          <h2>Which resolution?</h2>
          <p>
            72 DPI suits a quick preview or a chat message. 150 DPI is a good default for slides, documents and websites. 300
            DPI is for printing or zooming into fine detail; the PNG files grow quickly with resolution, so a long PDF at 300
            DPI makes a large ZIP.
          </p>

          <h2>PNG or JPG?</h2>
          <p>
            Use PNG for text, diagrams, tables and screenshots, where sharp edges matter. For scanned photo pages, or when a
            form limits the file size, <Link href="/tools/pdf-to-jpg">PDF to JPG</Link> gives smaller images. To shrink the
            PDF itself instead, use <Link href="/tools/compress-pdf">compress PDF</Link>.
          </p>

          <section aria-labelledby="privacy-heading">
            <h2 id="privacy-heading">Privacy: your PDF stays on your device</h2>
            <p>
              Each page is drawn in your browser and nothing is uploaded; see the <Link href="/privacy">privacy policy</Link>.
            </p>
          </section>
        </>
      }
    >
      <PdfToJpgTool format="png" />
    </ToolPageShell>
  );
}
