import type { Metadata } from "next";
import Link from "next/link";
import { ImageCompressorTool } from "@/components/tools/image-compressor-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("image-compressor");

const description =
  "Free image compressor for JPG, PNG and WebP. Reduce image file size without changing the dimensions, see exactly how much you saved, then download. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "Image Compressor – Compress JPG, PNG & WebP Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Is this image compression lossless?",
    answer:
      "Not by default. JPG and WebP drop fine detail that is hard to see, and PNG palette reduction is lossy too unless the image already has 256 colours or fewer. For PNGs, Manual mode offers Lossless, which keeps every pixel but saves less.",
  },
  {
    question: "Why is my compressed image not smaller?",
    answer:
      "Images saved by messaging apps or exported at low quality are already heavily compressed. The tool tells you, so you can keep the original, lower the quality in Manual mode, convert to WebP or reduce the dimensions.",
  },
  {
    question: "What quality setting should I use for JPG?",
    answer:
      "70–80% looks almost identical to the original for most photos; Automatic uses 75%. Use 85–90% for text or fine patterns, and go below 50% only when size matters far more than looks.",
  },
  {
    question: "How do I compress an image to a specific size, like 100 KB?",
    answer:
      "Use the Resize Image to KB tool. It searches for the highest quality that fits under your target and reduces dimensions only if quality alone isn't enough.",
  },
  {
    question: "Does compression change the image dimensions?",
    answer:
      "No. Width and height stay exactly the same; only the way the pixels are stored changes. To change dimensions, use the image resizer.",
  },
  {
    question: "How is PNG compressed?",
    answer:
      "PNG is lossless, so it only gets much smaller by storing fewer colours. The compressor picks the best palette of up to 256 colours, with light dithering to keep gradients smooth, and preserves transparency.",
  },
];

export default function ImageCompressorPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Image Compressor – Reduce Image File Size Online"
      intro={
        <p>
          Make JPG, PNG and WebP images smaller without changing their dimensions. Use Automatic for a good balance or Manual
          to choose the quality, then compare before and after.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to compress an image</h2>
          <ol>
            <li>Choose, drop or paste a JPG, PNG or WebP image; Automatic mode compresses it straight away.</li>
            <li>Compare the original size, new size and percentage saved.</li>
            <li>
              For more control, switch to <strong>Manual</strong> to set quality or PNG colours, or change the output format.
            </li>
            <li>Download the compressed image.</li>
          </ol>

          <h2>Compress JPG and JPEG photos</h2>
          <p>
            JPG and JPEG are the same format. JPG compression is lossy: Manual quality between 75% and 85% typically cuts the
            file substantially with little visible change, while below about 60% blockiness shows around edges and text.
            Re-saving an already compressed JPG saves less than compressing a camera original.
          </p>

          <h2>Compress PNG and WebP images</h2>
          <p>
            To compress PNG files, the tool reduces them to a palette of at most 256 colours, keeping transparency; savings
            are largest for screenshots and graphics. Choose <strong>Lossless</strong> in Manual mode to keep every pixel. A
            photo saved as PNG shrinks far more with <Link href="/tools/png-to-jpg">PNG to JPG</Link>, whereas{" "}
            <Link href="/tools/jpg-to-png">JPG to PNG</Link> makes files bigger. Converting to WebP is
            often the biggest single saving, but some upload forms still only accept JPG or PNG.
          </p>

          <h2>Reduce image size further</h2>
          <ul>
            <li>
              This image compressor never changes dimensions. For a photo thousands of pixels wide, the{" "}
              <Link href="/tools/image-resizer">image resizer</Link> usually saves more.
            </li>
            <li>
              Strict limit? <Link href="/tools/resize-image-to-kb">Reduce an image to an exact KB size</Link>, or use the{" "}
              <Link href="/tools/20kb-photo">20KB</Link>, <Link href="/tools/50kb-photo">50KB</Link>,{" "}
              <Link href="/tools/100kb-photo">100KB</Link> or <Link href="/tools/200kb-photo">200KB</Link> pages.
            </li>
            <li>Compress from the original whenever possible; each lossy re-save loses a little more detail.</li>
            <li>Smaller files load faster on mobile data and fit under email or upload limits.</li>
          </ul>

          <PrivacyNote>
            <p>
              Compression runs in your browser, so your image is never uploaded, and metadata such as GPS location is
              removed from the output.
            </p>
          </PrivacyNote>
        </>
      }
    >
      <ImageCompressorTool />
    </ToolPageShell>
  );
}
