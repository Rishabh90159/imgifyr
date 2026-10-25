import type { Metadata } from "next";
import Link from "next/link";
import { PdfToJpgTool } from "@/components/documents/pdf-to-jpg-tool";
import { ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { DOC_LIMITS } from "@/lib/documents/validate";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";
import { formatBytes } from "@/lib/utils/format";

const tool = getTool("pdf-to-jpg");

const description =
  "Convert PDF to JPG online, free: every page becomes a JPG at 72, 150 or 300 DPI, with an optional 50–500 KB limit per image. In your browser, with no upload.";

export const metadata: Metadata = pageMetadata({
  title: "PDF to JPG Converter – Convert PDF Pages to JPG Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I convert a PDF to JPG?",
    answer:
      "Choose your PDF, pick a resolution and select Convert to JPG. A one-page PDF downloads as a single JPG; a longer one downloads as a ZIP with one JPG per page, numbered in page order.",
  },
  {
    question: "Which resolution should I choose?",
    answer:
      "150 DPI suits most uses: sharp on screen and readable when printed. Choose 72 DPI for small files to send in chat, and 300 DPI for printing or zooming into small text.",
  },
  {
    question: "Can I convert a PDF to a JPG under 100 KB?",
    answer:
      "Yes. Set Maximum size per image to 100 KB. Each page is saved at the highest quality that fits, with pixel size reduced only if needed; if a page still can't fit, the result says so.",
  },
  {
    question: "Does it work with scanned PDFs?",
    answer:
      "Yes. Scanned pages are already images, so they convert like any other page. There's no OCR here; to get editable text from a PDF that has real text, use PDF to Word.",
  },
  {
    question: "Can I convert only some pages?",
    answer:
      "Every page is converted. The files in the ZIP are named by page number, so you can keep the pages you need and delete the rest.",
  },
  {
    question: "Are my PDFs uploaded?",
    answer: "No. The pages are drawn and saved as JPGs by your browser on your device. Nothing is sent to Imgifyr or anywhere else.",
  },
];

export default function PdfToJpgPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="PDF to JPG: Convert PDF Pages to JPG Images"
      intro={
        <p>
          Convert PDF to JPG images, one per page, for forms, chats or slides. Choose the resolution and, if you need it, a
          maximum size per image; your PDF isn&apos;t uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert PDF to JPG</h2>
          <ol>
            <li>Choose or drop a PDF.</li>
            <li>Pick 72, 150 or 300 DPI, and optionally a maximum size per image.</li>
            <li>
              Select <strong>Convert to JPG</strong>, then <strong>Download</strong> the JPG or the ZIP of all pages.
            </li>
          </ol>

          <h2>Resolution and file size</h2>
          <p>
            An A4 page becomes about 595 × 842 pixels at 72 DPI, 1240 × 1754 at 150 DPI and 2480 × 3508 at 300 DPI. With a
            size limit, this PDF to JPG converter lowers JPG quality first and pixel size only if needed, like{" "}
            <Link href="/tools/resize-image-to-kb">resizing an image to KB</Link>.
          </p>

          <h2>Supported files and limits</h2>
          <ul>
            <li>
              PDFs up to {formatBytes(DOC_LIMITS.pdfToJpgMaxBytes)} and {DOC_LIMITS.pdfToJpgMaxPages} pages, including scans.
            </li>
            <li>Very large pages are drawn at up to 25 megapixels to save memory.</li>
            <li>Transparent areas become white, since JPG has no transparency.</li>
            <li>PDFs that need a password to open must be unlocked first.</li>
          </ul>
          <p>
            Want to keep it a PDF but smaller? <Link href="/tools/compress-pdf">Compress the PDF</Link> instead. Going the
            other way? <Link href="/tools/jpg-to-pdf">JPG to PDF</Link> turns images back into a PDF.
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
      <PdfToJpgTool />
    </ToolPageShell>
  );
}
