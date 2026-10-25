import type { Metadata } from "next";
import Link from "next/link";
import { ImageSizeIncreaseTool } from "@/components/tools/image-size-increase-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("image-size-increase");

const description =
  "Increase image size in pixels, or increase the file size in KB to meet an upload minimum such as 20 KB, without changing how the picture looks. Free, in your browser.";

export const metadata: Metadata = pageMetadata({
  title: "Increase Image Size – In Pixels or in KB",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I increase an image's size in KB?",
    answer:
      "Choose File size (KB), enter the minimum the form asks for, and keep “Keep the picture, add padding”. A comment block that viewers ignore is added to the JPG until it reaches your target, while the picture stays identical.",
  },
  {
    question: "Is adding padding safe? Will the form accept the file?",
    answer:
      "Yes, the result is a standard JPG: comment blocks are part of the JPEG format and every viewer skips them. Forms check file type and size, and both meet the requirement.",
  },
  {
    question: "Does increasing the file size improve quality?",
    answer:
      "No. Padding adds bytes, not detail. The higher-quality method re-saves with less compression, which can reduce blockiness slightly but can't restore lost detail.",
  },
  {
    question: "What's the difference between increasing dimensions and file size?",
    answer:
      "Dimensions are width and height in pixels, which set how big the picture appears. File size is the kilobytes it takes up, which upload forms limit. You can raise the KB without touching the dimensions.",
  },
  {
    question: "How much can I enlarge an image?",
    answer:
      "The result can reach 32 MP, with no side longer than 16,384 pixels. For 2× and 4× enlargements of small images with stronger sharpening, use the image upscaler.",
  },
  {
    question: "Why does my form say my photo is too small?",
    answer:
      "Some forms set a minimum file size, such as 10 KB or 20 KB, as well as a maximum, and a small, simple image can fall below it. Raise it with File size (KB) here, staying under the maximum.",
  },
];

export default function ImageSizeIncreasePage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Increase Image Size in Pixels or KB"
      intro={
        <p>
          Make a picture bigger in pixels, or make the file bigger in KB to pass an upload form&apos;s minimum. Pick the mode
          below; everything runs in your browser.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to increase image size</h2>
          <ol>
            <li>Add a JPG, PNG or WebP image.</li>
            <li>Choose <strong>Dimensions (pixels)</strong> or <strong>File size (KB)</strong>.</li>
            <li>Enter a new width or height, or pick 125–300%; for KB, enter the minimum you need.</li>
            <li>Check the before and after sizes, and download.</li>
          </ol>

          <h2>Image size increase in pixels</h2>
          <p>
            Enlarging uses Lanczos-3 resampling plus light sharpening, with the aspect ratio locked so nothing is stretched.
            Expect a smoother image, not a more detailed one. For 2× or 4× use the{" "}
            <Link href="/tools/image-upscaler">image upscaler</Link>; to go smaller, the{" "}
            <Link href="/tools/image-resizer">image resizer</Link>.
          </p>

          <h2>Increasing the file size in KB</h2>
          <p>
            Exam and government forms often want files <em>between</em> two sizes, such as 20–50 KB, and a plain image can fall
            below the minimum. If the form also gives pixel dimensions, set those first.
          </p>
          <ul>
            <li>
              <strong>Keep the picture, add padding</strong>: hits the target exactly. JPGs keep their pixels; PNG and WebP
              are first saved as a 92% JPG.
            </li>
            <li>
              <strong>Higher quality / more pixels</strong>: re-saves with less compression and, if needed, slightly larger
              dimensions.
            </li>
          </ul>
          <p>
            File too <em>big</em> instead? Use <Link href="/tools/resize-image-to-kb">resize image to KB</Link>. Dull photos
            may look better after the <Link href="/tools/image-quality-enhancer">image quality enhancer</Link>.
          </p>

          <PrivacyNote>
            <p>Your image is processed on your device and isn&apos;t uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <ImageSizeIncreaseTool />
    </ToolPageShell>
  );
}
