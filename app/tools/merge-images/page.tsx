import type { Metadata } from "next";
import Link from "next/link";
import { MergeImagesTool } from "@/components/tools/merge-images-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("merge-images");

const description =
  "Free image combiner: merge photos into one image, stacked, side by side or in a grid, with optional spacing and background. Download PNG or JPG. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "Merge Images – Combine Photos into One Image Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I combine two photos into one image?",
    answer:
      "Add both photos, choose Horizontal for side by side or Vertical to stack them, and select Merge. The preview shows the result first, and you can download it as JPG or PNG.",
  },
  {
    question: "What happens when the images are different sizes?",
    answer:
      "You choose: Smallest scales bigger images down, Largest enlarges smaller ones, and Keep sizes leaves each as it is, centred. Images are always scaled in proportion, never stretched.",
  },
  {
    question: "How do I make a grid or collage?",
    answer:
      "Choose Grid and set the number of columns. Every cell gets the same size and each image is fitted inside it, so mixed portrait and landscape photos line up with the background filling the gaps.",
  },
  {
    question: "Can the background be transparent?",
    answer:
      "Yes. Choose Transparent and the merged image is saved as PNG, so spacing stays see-through. JPG can't store transparency, so JPG results always have a solid background.",
  },
  {
    question: "How many images can I merge?",
    answer:
      "Up to 30. If the combined picture would exceed what browsers can create (about 50 megapixels, or 16,384 pixels on a side), it's scaled down to fit and the tool tells you by how much.",
  },
  {
    question: "Are my photos uploaded?",
    answer: "No. The images are combined by your browser, on your device.",
  },
];

export default function MergeImagesPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Merge Images: Combine Photos into One"
      intro={
        <p>
          Join two or more pictures into one image: stacked, side by side or in a grid. Add spacing and a background, then
          download a JPG or PNG, all in your browser.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to merge images</h2>
          <ol>
            <li>Add your images; JPG, PNG, WebP and HEIC can be mixed.</li>
            <li>Put them in order with the arrow buttons.</li>
            <li>Choose Vertical, Horizontal or Grid, how sizes match, and the spacing and background.</li>
            <li>Check the live preview, select <strong>Merge</strong>, then download.</li>
          </ol>
          <p>
            Use this image combiner to merge photos for before-and-after pairs, a strip of screenshots, a product grid, or the
            front and back of a card in one upload.
          </p>

          <h2>Lining up images of different sizes</h2>
          <p>
            A vertical stack scales every image to the same width; side by side, to the same height. Matching the{" "}
            <strong>smallest</strong> keeps everything sharp, the <strong>largest</strong> keeps detail but softens small
            images, and <strong>Keep sizes</strong> suits screenshots. For a gap-free grid, first crop each photo to one shape
            with the{" "}
            <Link href="/tools/image-cropper">image cropper</Link>.
          </p>

          <h2>Supported files and limits</h2>
          <ul>
            <li>
              <strong>Input:</strong> JPG, PNG, WebP and iPhone HEIC, mixed freely; 2 to 30 images, up to 50 MB each.
            </li>
            <li>
              <strong>Output:</strong> one JPG with a quality setting, or one PNG that can keep a transparent background.
            </li>
            <li>
              <strong>Size:</strong> about 50 megapixels (16,384 pixels on a side) at most; larger results are scaled down to
              fit.
            </li>
          </ul>
          <p>
            Shrink a large result with the <Link href="/tools/image-resizer">image resizer</Link> or{" "}
            <Link href="/tools/image-compressor">image compressor</Link>. Want each picture on its own page? Use{" "}
            <Link href="/tools/photo-to-pdf">Photo to PDF</Link>. To combine PDF files instead, use{" "}
            <Link href="/tools/merge-pdf">Merge PDF</Link>.
          </p>

          <h2>Join a photo and signature into one image</h2>
          <p>
            Some application forms want the photo and signature in a single file. Add the photo first and the signature
            second, choose <strong>Vertical</strong>, set <strong>Match widths</strong> to <strong>Keep sizes</strong> so the
            signature isn&apos;t stretched, keep a <strong>White</strong> background and save as JPG. Prepare the signature with
            the <Link href="/tools/signature-resizer">signature resizer</Link>, and meet a file-size limit with{" "}
            <Link href="/tools/resize-image-to-kb">resize image to KB</Link>. Always follow the layout your form describes.
          </p>

          <PrivacyNote>
            <p>Your images are decoded and combined on your device. None of them is uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <MergeImagesTool />
    </ToolPageShell>
  );
}
