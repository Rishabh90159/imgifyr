import type { Metadata } from "next";
import Link from "next/link";
import { PdfTool, type PdfToolConfig } from "@/components/tools/pdf-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RASTER_INPUT_FORMATS } from "@/lib/image-processing/formats";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("photo-to-pdf-in-kb");

const description =
  "Photo to PDF in KB: turn photos or scans into one PDF of 100, 150, 200, 300 or 500 KB for upload forms. Image to PDF in KB size, free, in your browser.";

export const metadata: Metadata = pageMetadata({
  title: "Photo to PDF in KB – Image to PDF in 100, 200, 300 KB",
  description,
  path: tool.path,
});

const config: PdfToolConfig = {
  tool: "photo-to-pdf-in-kb",
  accept: RASTER_INPUT_FORMATS,
  prompt: "Drop photos to make a PDF in KB",
  maxFiles: 40,
  limitsKB: [100, 150, 200, 300, 500, 1024],
  defaultLimitKB: 200,
};

const faqs: FaqItem[] = [
  {
    question: "How do I convert a photo to PDF in KB?",
    answer: "Add the photo, pick the size the form allows under Maximum PDF size (200 KB is preselected) and select Create PDF.",
  },
  {
    question: "Can I make a photo to PDF in 100 KB?",
    answer: "Yes. Choose 100 KB. One or two pages fit well; for more pages, check that small writing is still readable.",
  },
  {
    question: "What if my form asks for 150 KB?",
    answer: "Pick 150 KB. The PDF comes out at that size or a little under; if it can't fit while staying readable, you get the smallest version and a note.",
  },
  {
    question: "Can I put several photos in one PDF?",
    answer: "Yes, up to 40. They share the size limit, so each page gets less room as you add more.",
  },
  {
    question: "Which photo formats work?",
    answer: "JPG, PNG, WebP and iPhone HEIC photos, in any mix.",
  },
  {
    question: "Are my photos uploaded?",
    answer: "No. The PDF is made by your browser on your device.",
  },
];

export default function PhotoToPdfInKbPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Photo to PDF in KB"
      intro={<p>Turn a photo or phone scan of a document into a PDF of exactly the KB size an upload form asks for.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make a PDF of the right KB size</h2>
          <ol>
            <li>Add one or more photos and put them in page order.</li>
            <li>
              Under <strong>Maximum PDF size</strong>, pick 100, 150, 200, 300 or 500 KB, or 1 MB.
            </li>
            <li>
              Select <strong>Create PDF</strong>; the size is shown before you download.
            </li>
          </ol>

          <h2>How the size is met</h2>
          <p>
            All pages are re-encoded together, lowering JPG quality first and pixel size only if that isn&apos;t enough, so
            the PDF lands at the limit or just under it. A tightly cropped photo keeps more detail: trim the edges with the{" "}
            <Link href="/tools/image-cropper">image cropper</Link> first. Already have a PDF that&apos;s too big? Use{" "}
            <Link href="/tools/compress-pdf-to-300kb">compress PDF to 300KB</Link> or{" "}
            <Link href="/tools/compress-pdf-to-100kb">to 100KB</Link>.
          </p>

          <PrivacyNote>
            <p>Your photos are turned into a PDF on your device and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <PdfTool config={config} />
    </ToolPageShell>
  );
}
