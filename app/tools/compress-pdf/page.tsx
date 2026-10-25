import type { Metadata } from "next";
import Link from "next/link";
import { CompressPdfTool } from "@/components/documents/compress-pdf-tool";
import { ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { COMPRESS_BASE_DPI, COMPRESS_MIN_DPI } from "@/lib/documents/compress-pdf";
import { DOC_LIMITS } from "@/lib/documents/validate";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";
import { formatBytes } from "@/lib/utils/format";

const tool = getTool("compress-pdf");

const description =
  "Compress a PDF to 100KB, 200KB, 500KB or any size for upload forms. A free PDF size reducer that keeps pages readable and runs in your browser, with no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Compress PDF to 100KB, 200KB or Any Size Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I compress a PDF to 200 KB?",
    answer:
      "Choose your PDF, select 200 KB as the target and select Compress. You get a PDF of 200 KB or less with its exact size shown; a PDF already under 200 KB comes back unchanged.",
  },
  {
    question: "Will the text in my PDF still be selectable?",
    answer:
      "Yes, if re-saving was enough. If pages had to be saved as images, they look the same but text can't be selected or searched, and links and fillable fields are removed. The result says which happened.",
  },
  {
    question: "Why can't my PDF reach the size I chose?",
    answer: `Every page needs some space to stay readable, so a small target may not fit many pages. The tool stops at about ${COMPRESS_MIN_DPI} DPI and gives you the smallest version it made; try a larger target or fewer pages.`,
  },
  {
    question: "Does compressing reduce the quality?",
    answer: `Re-saving loses nothing. Saving pages as images starts at ${COMPRESS_BASE_DPI} DPI and the highest JPG quality that fits, lowering resolution only as far as your target requires. Zoom in to check small print before uploading.`,
  },
  {
    question: "Is 1 KB 1,000 or 1,024 bytes?",
    answer:
      "This tool uses 1 KB = 1,024 bytes, as Windows and most upload forms do. If a form rejects a file that looks right, choose a slightly lower target, such as 190 KB for a 200 KB limit.",
  },
  {
    question: "Are my PDFs uploaded?",
    answer: "No. The PDF is read and compressed by your browser on your device, and isn't sent to Imgifyr or anywhere else.",
  },
];

export default function CompressPdfPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Compress PDF: Reduce PDF Size to 100KB, 200KB or Any Size"
      intro={
        <p>
          Compress a PDF to the size an upload form allows: 100 KB, 200 KB, 500 KB, 1 MB or your own target. This PDF size
          reducer runs in your browser, so your PDF isn&apos;t uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to compress PDF to 100KB or any size</h2>
          <ol>
            <li>Choose or drop your PDF.</li>
            <li>Pick the size the form allows, or enter your own in KB or MB.</li>
            <li>
              Select <strong>Compress</strong>, check the size shown, then <strong>Download PDF</strong>.
            </li>
          </ol>

          <h2>How the tool reaches your target</h2>
          <p>It tries the least destructive option first and stops as soon as the file fits:</p>
          <ol>
            <li>
              <strong>Already small enough:</strong> you get the original file back, untouched.
            </li>
            <li>
              <strong>Re-saved:</strong> the PDF is written in a more compact form; text stays selectable.
            </li>
            <li>
              <strong>Pages as images:</strong> each page becomes a JPG at {COMPRESS_BASE_DPI} DPI, lowered only if needed to
              about {COMPRESS_MIN_DPI} DPI. This is what shrinks large scans.
            </li>
          </ol>

          <h2>What changes when pages become images</h2>
          <p>
            The pages look the same, but text can&apos;t be selected or searched, links stop working and fillable fields become
            part of the image. That&apos;s fine for an application upload; keep the original if someone needs to edit it.
          </p>

          <h2>Supported files and limits</h2>
          <ul>
            <li>
              PDFs up to {formatBytes(DOC_LIMITS.compressMaxBytes)} and {DOC_LIMITS.compressMaxPages} pages, including scans
              and mixed page sizes.
            </li>
            <li>Targets from 10 KB to 50 MB. The result is always a standard PDF.</li>
            <li>PDFs that need a password to open must be unlocked first.</li>
          </ul>
          <p>
            To reduce PDF size further, delete pages the form doesn&apos;t need. Uploading several files as one?{" "}
            <Link href="/tools/merge-pdf">Merge the PDFs</Link> first, then compress. Form wants an image instead? Use{" "}
            <Link href="/tools/pdf-to-jpg">PDF to JPG</Link>.
          </p>

          <section aria-labelledby="privacy-heading">
            <h2 id="privacy-heading">Privacy: your PDF stays on your device</h2>
            <p>
              Your PDF is compressed in your browser and never uploaded; see the <Link href="/privacy">privacy policy</Link>.
            </p>
          </section>
        </>
      }
    >
      <CompressPdfTool />
    </ToolPageShell>
  );
}
