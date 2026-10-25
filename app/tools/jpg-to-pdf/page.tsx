import type { Metadata } from "next";
import Link from "next/link";
import { PdfTool, type PdfToolConfig } from "@/components/tools/pdf-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("jpg-to-pdf");

const description =
  "Convert JPG to PDF without recompressing, or keep the PDF under 100 KB, 200 KB or 500 KB for upload forms. One JPG per page, A4 or Letter. Free, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "JPG to PDF Converter – No Quality Loss, or Under 200KB",
  description,
  path: tool.path,
});

const config: PdfToolConfig = {
  tool: "jpg-to-pdf",
  accept: ["image/jpeg"],
  prompt: "Drop JPG images to convert to PDF",
  maxFiles: 100,
};

const faqs: FaqItem[] = [
  {
    question: "Does converting JPG to PDF reduce quality?",
    answer:
      "Not with Best quality selected. Each JPG's original bytes are copied into the PDF unchanged, with no decoding or re-saving, and the result tells you how many images were embedded this way.",
  },
  {
    question: "My phone photos are sideways in other converters. Will they be here?",
    answer:
      "No. Phones often store a photo sideways with an EXIF orientation note. This converter reads that note and turns the page content to match, while still embedding the original JPG unchanged.",
  },
  {
    question: "How do I convert JPG to PDF under 200 KB?",
    answer:
      "Add your JPGs and set Maximum PDF size to 200 KB. The tool finds the highest image quality that keeps the whole PDF within 200 KB, shrinking pixel dimensions only if needed. Up to 40 JPGs work with a limit.",
  },
  {
    question: "Are .jpeg and .jfif files accepted?",
    answer:
      "Yes. Each file's content is checked rather than its name, so any real JPEG works. Files that aren't JPEG are skipped with a message.",
  },
  {
    question: "How many JPGs can I put in one PDF?",
    answer:
      "Up to 100 in one go. Because the JPGs aren't re-encoded, even large batches are quick; the main limit is your device's memory for very large photos.",
  },
  {
    question: "Are my JPGs uploaded?",
    answer: "No. The PDF is assembled by your browser on your device, and your JPGs are never sent anywhere.",
  },
];

export default function JpgToPdfPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="JPG to PDF Converter"
      intro={
        <p>
          Convert JPG to PDF without losing quality: each JPG goes into the PDF exactly as it is, one image per page. Works with
          .jpg, .jpeg and .jfif files, in your browser.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert JPG to PDF</h2>
          <ol>
            <li>Choose or drop your JPG files.</li>
            <li>Arrange them with the up and down arrows; page 1 is at the top.</li>
            <li>Choose A4 or US Letter, orientation, Fit or Fill and a margin, and check the preview.</li>
            <li>
              Keep <strong>Best quality</strong> or pick a <strong>Maximum PDF size</strong>, then select{" "}
              <strong>Create PDF</strong>.
            </li>
          </ol>

          <h2>Why this JPG to PDF converter keeps full quality</h2>
          <p>
            Many converters re-compress each JPG, adding artefacts that can blur scanned text. PDF stores JPEG data natively
            (the &ldquo;DCTDecode&rdquo; filter), so this tool copies each file&apos;s bytes straight in, pixel-for-pixel.
          </p>

          <h2>JPG details the converter handles</h2>
          <ul>
            <li>
              <strong>Rotation:</strong> sideways phone photos are turned upright from their EXIF orientation.
            </li>
            <li>
              <strong>Greyscale</strong> scanner JPGs stay greyscale.
            </li>
            <li>
              <strong>Progressive JPGs</strong> are embedded as they are.
            </li>
            <li>
              <strong>CMYK JPGs</strong> are converted to RGB, since some viewers show them with wrong colours.
            </li>
          </ul>

          <h2>JPG to PDF under 100 KB, 200 KB or 500 KB</h2>
          <p>
            Pick the portal&apos;s limit under <strong>Maximum PDF size</strong>: all pages are re-encoded together until the
            file fits. If it can&apos;t fit while staying readable, you get the smallest version and a note. Already have a PDF that&apos;s too big?{" "}
            <Link href="/tools/compress-pdf">Compress the PDF</Link>. Mixing in PNG, WebP or HEIC? Use{" "}
            <Link href="/tools/photo-to-pdf">Photo to PDF</Link>.
          </p>

          <PrivacyNote>
            <p>Your JPGs are read and the PDF is built on your device, so scans never leave your browser.</p>
          </PrivacyNote>
        </>
      }
    >
      <PdfTool config={config} />
    </ToolPageShell>
  );
}
