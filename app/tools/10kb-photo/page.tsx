import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { TargetSizeTool } from "@/components/tools/target-size-tool";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("10kb-photo");

const description =
  "Compress a signature, thumb impression or small photo to 10KB or less. The tool keeps the best quality that fits, shows the exact size and works without uploading.";

export const metadata: Metadata = pageMetadata({
  title: "Resize Image to 10KB – Signature & Photo Under 10 KB",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I reduce an image to 10KB?",
    answer:
      "Add the image; the target is already 10 KB. The tool lowers JPG quality first and makes the picture smaller only when it has to, then shows the final size before you download.",
  },
  {
    question: "Is 10KB enough for a photo?",
    answer:
      "For a small passport-style face, yes, at roughly 200–300 pixels wide. A full scene or document won't stay readable at 10 KB; check whether the form allows more.",
  },
  {
    question: "Why does my signature look blurry at 10KB?",
    answer:
      "Usually because too much empty paper was kept. Crop close to the ink and make the paper white first with the signature resizer, then compress.",
  },
  {
    question: "The form says 10–20 KB. Which target should I use?",
    answer:
      "Use 20 KB, not 10. A range has a minimum, and a file under 10 KB is rejected. Set 20 KB as the target and 10 as the minimum in resize image to KB.",
  },
  {
    question: "Is my image uploaded?",
    answer: "No. The compression runs in your browser, so the file never leaves your phone or computer.",
  },
];

export default function TenKbPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Image to 10KB"
      intro={
        <p>
          Get a signature, thumb impression or small photo under 10 KB, the strictest limit some forms set. The exact size is
          shown before you download.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to compress an image to 10KB</h2>
          <ol>
            <li>Crop to just the signature, thumb or face. Every bit of background costs bytes.</li>
            <li>Add the image here; 10 KB is already selected.</li>
            <li>Check the preview at full size, then download the JPG.</li>
          </ol>

          <h2>What fits in 10KB</h2>
          <p>
            A clean signature on white paper keeps its strokes sharp, because white space compresses to almost nothing. A face
            photo comes out around 200–300 pixels wide. For a little more room, the{" "}
            <Link href="/tools/20kb-photo">20KB photo resizer</Link> or the{" "}
            <Link href="/tools/signature-resizer">signature resizer</Link>, which also whitens the paper, may suit the form
            better.
          </p>

          <PrivacyNote>
            <p>Your signature or photo is compressed in your browser and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <TargetSizeTool
        tool="10kb-photo"
        defaultTargetKB={10}
        quickStart
        presetsKB={[5, 10, 15, 20]}
        events={{ started: "kb_photo_started", completed: "kb_photo_completed", downloaded: "photo_downloaded" }}
      />
    </ToolPageShell>
  );
}
