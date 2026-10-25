import type { Metadata } from "next";
import Link from "next/link";
import { WordToPdfTool } from "@/components/documents/word-to-pdf-tool";
import { ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("word-to-pdf");

const description =
  "Convert Word DOCX documents to PDF online, free. Page size, orientation, tables, lists and images are kept, and the document is converted in your browser.";

export const metadata: Metadata = pageMetadata({
  title: "Word to PDF Converter Online Free – Convert DOCX to PDF",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Which Word files can I convert?",
    answer:
      "Word .docx documents up to 25 MB and 100 pages, from Word, Google Docs, LibreOffice or Pages. For .doc, RTF or password-protected files, save as .docx without a password first.",
  },
  {
    question: "Is my document uploaded?",
    answer:
      "No. The document is laid out and turned into a PDF by your browser on your device, and isn't sent to Imgifyr or anyone else; your browser's network tools confirm it.",
  },
  {
    question: "Will the PDF look exactly like my Word document?",
    answer:
      "Layout, tables, lists, images, headers and footers are kept. A font you don't have is replaced by a similar one, so lines may break slightly differently; text boxes, charts, SmartArt and equations may differ.",
  },
  {
    question: "Can I search and copy text in the PDF?",
    answer:
      "Yes, for Latin-alphabet text, through an invisible text layer over each page image. Other scripts, such as Hindi or Chinese, display correctly but can't be searched. For fully editable text, use Word's File › Save as › PDF.",
  },
  {
    question: "Why is the PDF larger than my Word file?",
    answer:
      "Each page is stored as a detailed image so it looks the same in every viewer, which takes more space than .docx text. A typical text page adds a few hundred KB.",
  },
];

export default function WordToPdfPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Word to PDF Converter"
      intro={
        <p>
          Convert a Word document (.docx) to PDF online for free, keeping page size, orientation, tables, lists and images. The
          DOCX to PDF conversion runs in your browser, so nothing is uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert Word to PDF</h2>
          <ol>
            <li>Choose or drop a .docx file.</li>
            <li>
              Select <strong>Convert to PDF</strong> and wait while each page is drawn.
            </li>
            <li>
              Select <strong>Download PDF</strong>, or <strong>Convert another document</strong>.
            </li>
          </ol>

          <h2>What&apos;s kept, and what to check</h2>
          <ul>
            <li>
              <strong>Kept:</strong> fonts, sizes and colours; lists; tables; pictures; page breaks, margins and landscape
              sections; headers and footers.
            </li>
            <li>
              <strong>Fonts:</strong> a missing font is replaced by a similar one of the same style, so line breaks may shift.
            </li>
            <li>
              <strong>May differ:</strong> text boxes, shapes, charts, SmartArt, equations, comments and tracked changes.
            </li>
            <li>
              <strong>Not supported:</strong> .doc, .rtf, .odt and password-protected files; save them as .docx first.
            </li>
          </ul>

          <h2>How the word to PDF converter works</h2>
          <p>
            The document is laid out as pages in a hidden, sandboxed frame, and macros are never run. Each page is drawn as an
            image with an invisible text layer, so the PDF stays searchable. Need to edit a PDF instead? Use{" "}
            <Link href="/tools/pdf-to-word">PDF to Word</Link>, or join files with <Link href="/tools/merge-pdf">Merge PDF</Link>
            .
          </p>

          <section aria-labelledby="privacy-heading">
            <h2 id="privacy-heading">Privacy: your document stays on your device</h2>
            <p>
              Your document is converted in your browser, never uploaded, and gone when you close the page; see the{" "}
              <Link href="/privacy">privacy policy</Link>.
            </p>
          </section>
        </>
      }
    >
      <WordToPdfTool />
    </ToolPageShell>
  );
}
