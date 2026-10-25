import type { Metadata } from "next";
import Link from "next/link";
import { MergePdfTool } from "@/components/documents/merge-pdf-tool";
import { ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("merge-pdf");

const description =
  "Merge up to 30 PDFs into one in your order, and keep the result under 200 KB, 500 KB or 1 MB if a form sets a limit. Free, in your browser, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Merge PDF Files Online Free – Combine PDFs into One",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Does merging change the quality of my PDFs?",
    answer:
      "No. Pages are copied across as they are: text stays text, images aren't recompressed, and each page keeps its size and orientation.",
  },
  {
    question: "How do I change the order?",
    answer:
      "Files are joined from the top of the list down. Move one with its up and down arrows, or drag it on a computer; the × button removes it.",
  },
  {
    question: "How many PDFs can I combine?",
    answer:
      "Up to 30 PDFs at once, up to 100 MB each and 200 MB together. For more, merge them in groups and then merge the results.",
  },
  {
    question: "Can I merge PDFs and keep the file under 200 KB?",
    answer:
      "Yes. Pick a limit under Keep the merged PDF under. If the joined file is bigger, it's shrunk to fit; when pages must become images to fit, you're told, since their text is no longer selectable.",
  },
  {
    question: "What isn't kept in the merged PDF?",
    answer:
      "Page content is kept. Bookmarks (the outline), digital signatures, fillable form fields and file attachments from the original PDFs may not carry over.",
  },
  {
    question: "Are my PDFs uploaded?",
    answer: "No. Merging happens locally in your browser, and nothing is sent to Imgifyr's servers.",
  },
];

export default function MergePdfPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Merge PDF Files"
      intro={
        <p>
          Merge PDF files online into one document, in the order you choose. Pages are copied unchanged, and your PDFs
          aren&apos;t uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to merge PDF files</h2>
          <ol>
            <li>Choose or drop two or more PDF files. You can add more at any time.</li>
            <li>Put them in order with the up and down arrows; the top file comes first.</li>
            <li>
              Select the <strong>Merge</strong> button, then <strong>Download PDF</strong>.
            </li>
          </ol>

          <h2>Combine PDF files without losing quality</h2>
          <p>
            Nothing is printed or converted. Each page keeps its text, fonts, images and size, so mixed A4 and Letter,
            portrait and landscape pages stay as they were. Damaged or password-locked files are skipped with an explanation.
          </p>

          <h2>Merging PDFs under a size limit</h2>
          <p>
            A form&apos;s limit applies to the single file you upload. Choose one and the tool joins first, then shrinks the
            result only if it&apos;s too big. Up to 50 pages can be shrunk this way; for longer documents, cut unneeded pages
            first.
          </p>
          <p>
            Have photos or scans instead? Turn them into a PDF with <Link href="/tools/jpg-to-pdf">JPG to PDF</Link> or{" "}
            <Link href="/tools/photo-to-pdf">Photo to PDF</Link>, then merge. For a Word file, use{" "}
            <Link href="/tools/word-to-pdf">Word to PDF</Link>.
          </p>

          <section aria-labelledby="privacy-heading">
            <h2 id="privacy-heading">Privacy: your PDFs stay on your device</h2>
            <p>
              The PDFs are joined in your browser and never stored by Imgifyr; see the{" "}
              <Link href="/privacy">privacy policy</Link>.
            </p>
          </section>
        </>
      }
    >
      <MergePdfTool />
    </ToolPageShell>
  );
}
