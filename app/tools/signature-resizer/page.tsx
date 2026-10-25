import type { Metadata } from "next";
import Link from "next/link";
import { SignatureResizerTool } from "@/components/tools/signature-resizer-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("signature-resizer");

const description =
  "Resize, crop and clean up a signature image for online forms. Whiten or remove the background, set exact pixels and a KB limit, and download JPG or PNG.";

export const metadata: Metadata = pageMetadata({
  title: "Signature Resizer – Resize Signature Image for Online Forms",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I reduce my signature to 20 KB?",
    answer:
      "Crop tightly, choose Clean white background, set the form's pixel size, keep JPG and enter 20 as the maximum file size. A signature on pure white compresses very well, so small limits are usually easy to reach.",
  },
  {
    question: "What size should a signature image be?",
    answer:
      "It depends on the form. Most portals state a width and height in pixels (or centimetres at a given DPI) and a file size range; use exactly those numbers, as this tool doesn't assume a standard size.",
  },
  {
    question: "How do I make a signature background transparent?",
    answer:
      "Choose Transparent as the background: paper and shadows disappear and the ink keeps smooth edges. Transparent images must be PNG, while most application forms want a white background instead.",
  },
  {
    question: "Parts of my signature disappeared. What should I do?",
    answer:
      "Move the clean-up strength slider left to keep lighter strokes, or right if grey shadows remain. A dark pen on plain white paper in good light gives the cleanest result.",
  },
  {
    question: "Should I use JPG or PNG?",
    answer:
      "Use whatever the form asks for. JPG is the most widely accepted and can be squeezed to a KB limit; PNG keeps edges crisp and is needed for transparency.",
  },
  {
    question: "Is my signature uploaded?",
    answer:
      "No. Your signature is processed entirely in your browser and never leaves your device, which matters for something that can authorise documents.",
  },
];

export default function SignatureResizerPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Signature Resizer: Resize a Signature for Online Forms"
      intro={
        <p>
          Turn a phone photo or scan of your signature into a clean image that meets a form&apos;s pixel and KB limits. Your
          signature never leaves your device.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to resize signature images</h2>
          <ol>
            <li>Sign on plain white paper with a dark pen and photograph or scan it in good light.</li>
            <li>Add the image and crop tightly around the signature; rotate if needed.</li>
            <li>Choose Clean white, or Transparent for a PNG without background.</li>
            <li>Enter the form&apos;s width, height and maximum KB, then check every stroke and download.</li>
          </ol>
          <p>
            Exam, job and government forms each set their own dimensions, file type and KB range, so nothing is pre-filled.
          </p>

          <h2>Why clean up the background?</h2>
          <p>
            Phone photos of paper have grey tones, shadows and noise that look dirty and bloat the file. Clean-up turns light
            pixels pure white (or transparent) and keeps the ink with smooth edges, often making the file several times
            smaller.
          </p>

          <h2>Signature resize to a KB limit</h2>
          <ul>
            <li>Crop tightly: empty space still costs bytes.</li>
            <li>Use Clean white and the exact pixel size the form asks for, not larger.</li>
            <li>JPG quality is lowered only as needed; if the limit can&apos;t be met, the tool shows the smallest size reached.</li>
          </ul>
          <p>
            Only need a file size without cleanup? Use <Link href="/tools/resize-image-to-kb">resize image to KB</Link> or the{" "}
            <Link href="/tools/image-compressor">image compressor</Link>. For general framing, try the{" "}
            <Link href="/tools/image-cropper">image cropper</Link>, and for the photo, the{" "}
            <Link href="/tools/passport-photo-resizer">passport photo resizer</Link>.
          </p>

          <PrivacyNote>
            <p>Your signature is processed in your browser, never uploaded or stored, and gone when you close the page or Reset.</p>
          </PrivacyNote>
        </>
      }
    >
      <SignatureResizerTool />
    </ToolPageShell>
  );
}
