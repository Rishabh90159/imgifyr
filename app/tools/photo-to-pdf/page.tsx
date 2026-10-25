import type { Metadata } from "next";
import Link from "next/link";
import { PdfTool, type PdfToolConfig } from "@/components/tools/pdf-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RASTER_INPUT_FORMATS } from "@/lib/image-processing/formats";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("photo-to-pdf");

const description =
  "Convert photos to PDF in your browser: combine JPG, PNG, WebP and HEIC images into one file and keep it under 200 KB or any limit. Free, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Photo to PDF Converter – Convert Images to PDF Online",
  description,
  path: tool.path,
});

const config: PdfToolConfig = {
  tool: "photo-to-pdf",
  accept: RASTER_INPUT_FORMATS,
  prompt: "Drop photos to turn into a PDF",
  maxFiles: 100,
};

const faqs: FaqItem[] = [
  {
    question: "How do I combine several photos into one PDF?",
    answer:
      "Add all the photos at once, or more later with Add images. Each photo becomes one page in the order shown, which you can change with the arrow buttons. Then select Create PDF.",
  },
  {
    question: "Can I mix JPG, PNG, WebP and HEIC photos in one PDF?",
    answer:
      "Yes. iPhone HEIC photos are decoded in your browser first, and transparent areas in PNG and WebP images are placed on white, like a printed page.",
  },
  {
    question: "Will my photos lose quality in the PDF?",
    answer:
      "With Best quality, JPG photos go in untouched and other formats are saved as 92% JPG, which looks the same at normal size. Smaller file reduces large images, which you'll notice only when zooming in.",
  },
  {
    question: "Can I make a photo PDF under 100 KB or 200 KB?",
    answer:
      "Yes. Choose the cap under Maximum PDF size and all photos are re-encoded together at the best quality that fits, reduced in pixels only when needed. Up to 40 photos fit in one PDF with a cap.",
  },
  {
    question: "Does it work on a phone?",
    answer:
      "Yes. Pick photos from your gallery or camera roll, reorder them and download the PDF. Batches are limited to 100 images to keep memory use reasonable.",
  },
  {
    question: "Are my photos uploaded?",
    answer: "No. The PDF is built by your browser from the photos on your device. Nothing is sent to a server.",
  },
];

export default function PhotoToPdfPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Photo to PDF Converter"
      intro={
        <p>
          Turn photos, scans and screenshots into one PDF: JPG, PNG, WebP or iPhone HEIC, in any mix. This photo to PDF
          converter works entirely in your browser.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert images to PDF</h2>
          <ol>
            <li>Choose or drop your photos. You can add more later.</li>
            <li>Reorder them with the arrow buttons; each photo becomes one page.</li>
            <li>Set the page size, orientation, layout and margin, then check each page in the preview.</li>
            <li>
              Select <strong>Create PDF</strong> and download it.
            </li>
          </ol>

          <h2>Page settings explained</h2>
          <ul>
            <li>
              <strong>Orientation: Auto</strong> gives a landscape photo a landscape page, even among portrait ones.
            </li>
            <li>
              <strong>Fit</strong> keeps the whole photo visible; <strong>Fill</strong> covers the page and crops the overflow.
            </li>
            <li>
              <strong>Margins</strong> matter for printing, since most home printers can&apos;t reach the edge.
            </li>
            <li>
              Several photos on one page? <Link href="/tools/merge-images">Merge the images</Link> first.
            </li>
          </ul>

          <h2>Supported formats</h2>
          <p>
            JPG/JPEG, PNG, WebP and HEIC/HEIF; GIF, TIFF and BMP need converting first. If every file is a JPG, the{" "}
            <Link href="/tools/jpg-to-pdf">JPG to PDF converter</Link> embeds them with no quality loss.
          </p>

          <h2>Photo to PDF under a size limit</h2>
          <p>
            Forms that want certificates as one PDF usually cap its size. Pick a cap from 100 KB to 1 MB under{" "}
            <strong>Maximum PDF size</strong> and quality is balanced across every page so the file fits. Shoot documents in
            good light and trim them with the <Link href="/tools/image-cropper">image cropper</Link>: less background leaves
            more detail for the writing.
          </p>

          <PrivacyNote>
            <p>Photos of documents and IDs stay on your device, because the PDF is assembled by your browser.</p>
          </PrivacyNote>
        </>
      }
    >
      <PdfTool config={config} />
    </ToolPageShell>
  );
}
