import type { Metadata } from "next";
import Link from "next/link";
import { CircleCropTool } from "@/components/tools/circle-crop-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("circle-crop");

const description =
  "Circle crop an image online: place a round frame over a photo or logo, add a border if you like, and download a transparent PNG or a JPG. Free, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Circle Crop – Cut a Photo or Logo into a Circle Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I make a round profile picture?",
    answer:
      "Drop your photo, drag and zoom the square until the dashed circle frames your face, then select Crop to circle. Download the PNG and upload it as your picture.",
  },
  {
    question: "Why are the corners shown as a checkerboard?",
    answer:
      "The checkerboard means transparent. Everything outside the circle is see-through in the PNG, so it takes on the colour of whatever page or slide it is placed on.",
  },
  {
    question: "Can I add a border around the circle?",
    answer:
      "Yes. Choose Thin or Thick and a colour. The border is drawn inside the edge of the circle and scales with the size you pick, so it looks the same at any size.",
  },
  {
    question: "When should I choose JPG instead of PNG?",
    answer:
      "When a site or form doesn't accept PNG, or you want a smaller file. The JPG fills the corners with white or your chosen colour, since JPG can't be transparent.",
  },
  {
    question: "Can I crop an oval or a rectangle instead?",
    answer:
      "This tool makes circles only. For rectangles and squares, including exact ratios such as 16:9, use the image cropper.",
  },
  {
    question: "Is my image uploaded?",
    answer: "No. Cropping and masking happen in your browser, so the picture never leaves your device.",
  },
];

export default function CircleCropPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Circle Crop Image"
      intro={
        <p>
          Crop any photo or logo into a perfect circle for profile pictures, team pages and slides. The corners become
          transparent, or a colour you choose.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to crop an image into a circle</h2>
          <ol>
            <li>Choose or drop a JPG, PNG, WebP or iPhone HEIC image.</li>
            <li>Move and resize the square; the dashed circle shows exactly what is kept.</li>
            <li>Pick the size, the corners (transparent or a colour) and an optional border.</li>
            <li>Select <strong>Crop to circle</strong> and download.</li>
          </ol>

          <h2>Transparent PNG or JPG</h2>
          <p>
            A transparent PNG is the most flexible: on a dark or light page the circle sits cleanly, with smooth edges and no
            square showing. Choose a JPG with white or coloured corners only when the place you upload to rejects PNG or
            needs a small file.
          </p>

          <h2>Choosing a size</h2>
          <p>
            <strong>Keep crop size</strong> uses every pixel inside your selection. The fixed sizes scale it to 1000, 500 or
            200 pixels across; picking more pixels than the crop has makes it softer, not sharper. To cut the person out of the
            background first, use the <Link href="/tools/background-remover">background remover</Link>.
          </p>

          <PrivacyNote>
            <p>Your image is cropped on your device and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <CircleCropTool />
    </ToolPageShell>
  );
}
