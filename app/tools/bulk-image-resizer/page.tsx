import type { Metadata } from "next";
import Link from "next/link";
import { BulkImageResizerTool } from "@/components/tools/bulk-image-resizer-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("bulk-image-resizer");

const description =
  "Resize multiple images at once in your browser. Set a width, height or percentage, choose the format and quality, and download them all as a ZIP. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "Bulk Image Resizer – Resize Multiple Images at Once",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How many images can I resize at once?",
    answer:
      "Up to 200 images per batch, each up to 50 MB. Your device's memory is the practical limit: a desktop copes with large batches, while on a phone batches of 20–50 work best.",
  },
  {
    question: "What happens to images with different shapes?",
    answer:
      "With “Lock aspect ratio” on, each image keeps its own proportions and fits within your width and height, so landscape and portrait photos get different dimensions but neither is stretched.",
  },
  {
    question: "What if one of the images fails?",
    answer:
      "The rest of the batch carries on. The failed file is marked with a plain-language reason, such as a damaged file or unsupported format, and you can remove it or retry.",
  },
  {
    question: "Can I convert formats while resizing?",
    answer:
      "Yes. Choose JPG, PNG or WebP as the output, or keep each image's original format. iPhone HEIC photos are saved as JPG.",
  },
  {
    question: "Are the images uploaded?",
    answer: "No. Every image is resized by your browser and the ZIP is assembled locally; nothing is sent to a server.",
  },
  {
    question: "Why is the ZIP file about the same size as the images?",
    answer:
      "JPG, PNG and WebP are already compressed, so zipping saves almost nothing; the ZIP just bundles them. Lower the quality or dimensions to make the files smaller.",
  },
];

export default function BulkImageResizerPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Bulk Image Resizer: Resize Multiple Images at Once"
      intro={
        <p>
          Resize multiple images with one size rule and download them singly or as a ZIP. This bulk image resizer works in
          your browser, so nothing is uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to resize images in bulk</h2>
          <ol>
            <li>Add several JPG, PNG, WebP or HEIC files; each gets a thumbnail.</li>
            <li>Enter a width, height or both, or a percentage.</li>
            <li>Pick the output format and quality, then select Resize all.</li>
            <li>Download files one by one, or the whole batch as a ZIP.</li>
          </ol>

          <h2>Size rules for a mixed batch</h2>
          <ul>
            <li>
              <strong>Width only</strong>: every image gets that width; heights follow each one&apos;s proportions.
            </li>
            <li>
              <strong>Width and height, locked</strong>: each image fits inside the box without stretching.
            </li>
            <li>
              <strong>Width and height, unlocked</strong>: every image becomes exactly that size.
            </li>
            <li>
              <strong>Percentage</strong>: each image is scaled by the same factor.
            </li>
          </ul>
          <p>&ldquo;Don&apos;t enlarge smaller images&rdquo; leaves images below the target at their own size.</p>

          <h2>Single-image tools</h2>
          <p>
            For one image, use the <Link href="/tools/image-resizer">image resizer</Link>, or{" "}
            <Link href="/tools/resize-jpg">resize JPG</Link> with a print DPI,{" "}
            <Link href="/tools/resize-png">resize PNG</Link> with colour reduction, and{" "}
            <Link href="/tools/resize-gif">resize animated GIFs</Link> frame by frame. For a strict limit such as 100 KB, use{" "}
            <Link href="/tools/resize-image-to-kb">resize image to KB</Link>.
          </p>

          <PrivacyNote>
            <p>Every image is resized on your device and the ZIP is built in your browser, so no photo is uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <BulkImageResizerTool />
    </ToolPageShell>
  );
}
