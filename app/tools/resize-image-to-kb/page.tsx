import type { Metadata } from "next";
import Link from "next/link";
import { TargetSizeTool } from "@/components/tools/target-size-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("resize-image-to-kb");

const description =
  "Reduce an image to a target file size such as 20KB, 50KB, 100KB or 200KB for application forms and uploads, keeping the best possible quality. Free, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Resize Image in KB – 20KB, 50KB, 100KB, 200KB or Any Size",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I resize an image to 50 KB?",
    answer:
      "Select your image, choose 50 KB as the target and select Resize. You get the highest quality that stays at or below 50 KB, with dimensions reduced only if needed, and the exact result before download.",
  },
  {
    question: "Can every image be reduced to exactly 100 KB?",
    answer:
      "Not to the byte. Encoders work in steps, so the result is the best file at or below the target, such as 96 KB, which is what forms check. If a target truly can't be reached, the closest achievable size is shown.",
  },
  {
    question: "Why did the dimensions of my image change?",
    answer:
      "When no reasonable quality fits under the target, the image is made smaller instead of blocky; a sharp 1200-pixel photo beats a crushed full-size one. Turn off “Allow smaller dimensions” if your form needs the original dimensions.",
  },
  {
    question: "How do I resize an image to between 20 KB and 50 KB?",
    answer:
      "Choose 50 KB as the target and enter 20 in Minimum size. If the best JPG comes out under 20 KB, padding that viewers ignore lifts it into the range without changing the picture.",
  },
  {
    question: "Is 1 KB 1,000 or 1,024 bytes?",
    answer:
      "This tool uses 1,024 bytes, like Windows and most upload forms. A few systems count 1,000, so if a form rejects your file, aim slightly lower, such as 48 KB for a 50 KB limit.",
  },
  {
    question: "My form needs both specific dimensions and a file size. What should I do?",
    answer:
      "Set the exact width and height in the image resizer first, then bring that image here with “Allow smaller dimensions” turned off so only the quality changes.",
  },
];

export default function ResizeImageToKbPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Image to KB: Reduce a Photo to 20KB, 50KB, 100KB or Any Size"
      intro={
        <p>
          Need a photo under 50 KB for an application form, or under 200 KB for a job portal? Pick a target and the tool
          finds the highest quality that fits, entirely in your browser.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to resize image in KB</h2>
          <ol>
            <li>Choose, drop or paste a JPG, PNG or WebP image.</li>
            <li>
              Pick 20, 50, 100, 200 or 500 KB, or <strong>Custom</strong> for any size in KB or MB.
            </li>
            <li>
              Leave <strong>Allow smaller dimensions</strong> on unless your form requires exact pixel dimensions.
            </li>
            <li>Select <strong>Resize</strong>, check the preview and the final size, then download.</li>
          </ol>

          <h2>How the tool reaches your target size</h2>
          <p>File size depends on content, dimensions and quality, so it can&apos;t be set directly. Instead the tool searches:</p>
          <ol>
            <li>Full size at high quality first; if that fits, you get the best possible result.</li>
            <li>Then lower quality levels at full size, down to one that still looks good.</li>
            <li>Only then smaller dimensions, raising quality again to use the whole budget.</li>
            <li>Every attempt is measured on the real encoded file, so &ldquo;at or below&rdquo; is guaranteed.</li>
          </ol>
          <p>
            Read the <Link href="/methodology">methodology</Link> for the technical details.
          </p>

          <h2>Between two sizes: 10–20 KB, 20–50 KB, 100–200 KB</h2>
          <p>
            Many forms reject files that are too small as well as too big. Set the upper limit as the target and the lower
            one under <strong>Minimum size</strong>; if the shrunk JPG falls short, it is padded up without touching a single
            pixel. To make an image larger in KB on its own, use the{" "}
            <Link href="/tools/image-size-increase">image size increaser</Link>.
          </p>

          <h2>Dedicated pages for common sizes</h2>
          <p>
            Application forms often cap photos and signatures at 20, 50 or 100 KB, and portals often allow 200 KB to 1 MB
            for document scans. For the most common limits there are pages with the target preset and size-specific advice:{" "}
            <Link href="/tools/20kb-photo">20KB photo</Link>, <Link href="/tools/50kb-photo">50KB photo</Link>,{" "}
            <Link href="/tools/100kb-photo">100KB photo</Link> and <Link href="/tools/200kb-photo">200KB photo</Link>. Exam
            or passport photo with a pixel size too? See <Link href="/tools/passport-photo">passport photo requirements</Link>{" "}
            or <Link href="/tools/ibps-photo">IBPS photo</Link>. Need exact pixels?{" "}
            <Link href="/tools/image-resizer">Resize the dimensions</Link> first. No fixed target?{" "}
            <Link href="/tools/image-compressor">Compress the image</Link> instead.
          </p>

          <PrivacyNote>
            <p>
              Every step of the size search runs on your own device, so ID photos, signatures and documents are never
              uploaded or stored.
            </p>
          </PrivacyNote>
        </>
      }
    >
      <TargetSizeTool readTargetFromUrl />
    </ToolPageShell>
  );
}
