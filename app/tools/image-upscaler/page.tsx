import type { Metadata } from "next";
import Link from "next/link";
import { ImageUpscalerTool } from "@/components/tools/image-upscaler-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("image-upscaler");

const description =
  "Free image upscaler: enlarge a photo 2× or 4× to increase its resolution, using Lanczos resampling and adjustable sharpening. Compare, then download. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "Free Image Upscaler – Increase Image Resolution Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Is this an AI image upscaler?",
    answer:
      "No. It uses Lanczos-3 interpolation and optional sharpening, giving crisper edges than a simple stretch without inventing texture. AI models are too slow on a phone in a browser, and a server would mean uploading your photo.",
  },
  {
    question: "Does upscaling improve image quality?",
    answer:
      "It makes the image bigger while staying as sharp as the original allows, but a blurry, noisy or heavily compressed photo stays that way. For dull or soft photos, try the image quality enhancer too.",
  },
  {
    question: "Should I choose 2× or 4×?",
    answer:
      "Use 2× when an image is a little too small, such as a 600-pixel photo needed at 1200. Use 4× for small icons, logos or old thumbnails. Pick the smallest factor that reaches your size, or enter an exact width.",
  },
  {
    question: "What is the largest image I can create?",
    answer:
      "Up to 32 megapixels and 16,384 pixels on the longest side, for example 6,500 × 4,900. Larger sizes often crash phone browsers; if 4× is too big, the tool says so and you can enter a custom width.",
  },
  {
    question: "How big should an image be for printing?",
    answer:
      "Aim for about 300 pixels per inch: about 1800 × 1200 pixels for a 6 × 4 inch print and 2480 × 3508 for A4. Upscaling reaches those numbers, but the print is only as detailed as the original.",
  },
  {
    question: "Why is the upscaled PNG so large?",
    answer:
      "PNG is lossless, and a 4× enlargement has 16 times as many pixels. Choose JPG for photos if you need a smaller file; at 92% quality the difference is hard to see.",
  },
];

export default function ImageUpscalerPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Image Upscaler – Upscale Images Online"
      intro={
        <p>
          Enlarge a small JPG, PNG, WebP or HEIC image 2×, 4× or to an exact width. Edges stay crisper than a plain stretch,
          and the work happens in your browser.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to upscale an image</h2>
          <ol>
            <li>Choose, drop or paste an image.</li>
            <li>Pick 2×, 4× or a custom width; the height follows, so nothing is stretched.</li>
            <li>Set the sharpening and choose PNG (lossless, keeps transparency) or JPG.</li>
            <li>Select <strong>Upscale image</strong>, compare with the divider, then download.</li>
          </ol>

          <h2>How the upscaler works</h2>
          <p>
            Each new pixel is calculated from its neighbours. Lanczos-3 samples a wider area than the bilinear or bicubic
            scaling most apps use, so fine lines stay defined. An optional unsharp mask then boosts edge contrast on brightness
            only, so colours don&apos;t fringe and flat areas stay clean. It is not AI super-resolution: no detail is made up.
          </p>

          <h2>Increase image resolution for print or listings</h2>
          <p>
            Resolution here means pixel count: a 600 × 400 image upscaled 4× becomes 2400 × 1600, which is what print shops and
            marketplaces check. To make images smaller, use the <Link href="/tools/image-resizer">image resizer</Link>; to
            reach a form&apos;s minimum KB rather than more pixels, use{" "}
            <Link href="/tools/image-size-increase">image size increase</Link>.
          </p>

          <h2>Limits worth knowing</h2>
          <ul>
            <li>Blur, noise and compression blocks get enlarged too, so start from the best copy you have.</li>
            <li>Unreadable text won&apos;t become readable.</li>
            <li>
              Big results can be shrunk with the <Link href="/tools/image-compressor">image compressor</Link>.
            </li>
            <li>
              Flat-looking photos also benefit from the <Link href="/tools/image-quality-enhancer">image quality enhancer</Link>.
            </li>
          </ul>

          <PrivacyNote>
            <p>Upscaling runs on your device, and the enlarged copy is created locally without uploading anything.</p>
          </PrivacyNote>
        </>
      }
    >
      <ImageUpscalerTool />
    </ToolPageShell>
  );
}
