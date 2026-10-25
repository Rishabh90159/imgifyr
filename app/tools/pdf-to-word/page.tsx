import type { Metadata } from "next";
import Link from "next/link";
import { PdfToWordTool } from "@/components/documents/pdf-to-word-tool";
import { ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("pdf-to-word");

const description =
  "Convert PDF to an editable Word DOCX online, free. Text, headings, lists and simple tables are rebuilt from text-based PDFs, in your browser with no upload.";

export const metadata: Metadata = pageMetadata({
  title: "PDF to Word Converter Online Free – Editable DOCX",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Will the Word document be editable?",
    answer:
      "Yes. The result is a real .docx with normal paragraphs, Word heading styles, bulleted lists and tables you can edit and reflow, not an image of the PDF pasted into Word.",
  },
  {
    question: "Does it work with scanned PDFs?",
    answer:
      "No. A scanned page is a picture with no text, and reading it needs OCR, which this tool doesn't do. In a mixed PDF, text pages are converted and each scanned page is marked.",
  },
  {
    question: "How can I tell if my PDF has real text?",
    answer:
      "Open it in a PDF reader and try to select or search for a word. If you can, it will convert. If the whole page highlights like a picture, it's a scan.",
  },
  {
    question: "How close is the layout to the PDF?",
    answer:
      "Pages keep their size and orientation, text stays in reading order, and fonts, sizes, bold and italic are kept. Two-column pages become one column, images aren't carried over, and complex layouts may need tidying.",
  },
  {
    question: "Is there a size or page limit?",
    answer:
      "PDFs up to 50 MB and 200 pages. PDFs that need a password to open aren't supported; remove the password first.",
  },
  {
    question: "Is my PDF uploaded?",
    answer:
      "No. The PDF is read and the Word file is created by your browser on your device. Nothing is sent to Imgifyr or a conversion service.",
  },
];

export default function PdfToWordPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="PDF to Word Converter"
      intro={
        <p>
          Convert PDF to Word (.docx) for free: text, headings, lists and simple tables are rebuilt as editable Word content.
          It runs in your browser, so the PDF isn&apos;t uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert PDF to Word</h2>
          <ol>
            <li>Choose or drop a PDF file.</li>
            <li>
              Select <strong>Convert to Word</strong>.
            </li>
            <li>
              Select <strong>Download DOCX</strong> and open it in Word, Google Docs or LibreOffice.
            </li>
          </ol>

          <h2>Text PDFs and scanned PDFs</h2>
          <p>
            PDFs exported from Word, Google Docs or websites contain real text and convert well. Scans contain only pictures
            of text; this PDF to Word converter doesn&apos;t do OCR, so it tells you when a page is a scan.
          </p>

          <h2>What the converter rebuilds</h2>
          <ul>
            <li>
              <strong>Paragraphs</strong> are rejoined from separate lines, so text reflows as you edit.
            </li>
            <li>
              <strong>Headings</strong> get Word heading styles, so they appear in the navigation pane.
            </li>
            <li>
              <strong>Lists and tables</strong> become Word lists and tables where the PDF has clear bullets or columns.
            </li>
            <li>
              <strong>Pages</strong> keep their size and orientation; bold and italic stay.
            </li>
          </ul>

          <h2>Limitations</h2>
          <p>
            Structure is inferred from where characters are drawn. Images aren&apos;t carried over, and multi-column layouts,
            footnotes, equations and form fields may differ, so review the document. Finished editing? Turn it back with{" "}
            <Link href="/tools/word-to-pdf">Word to PDF</Link>, or join files with <Link href="/tools/merge-pdf">Merge PDF</Link>
            .
          </p>

          <section aria-labelledby="privacy-heading">
            <h2 id="privacy-heading">Privacy: your PDF stays on your device</h2>
            <p>
              The Word file is created in your browser and nothing is uploaded; see the{" "}
              <Link href="/privacy">privacy policy</Link>.
            </p>
          </section>
        </>
      }
    >
      <PdfToWordTool />
    </ToolPageShell>
  );
}
