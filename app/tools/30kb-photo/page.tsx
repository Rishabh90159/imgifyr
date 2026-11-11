import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { TargetSizeTool } from "@/components/tools/target-size-tool";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("30kb-photo");

const description =
  "Resize a photo or signature to 30KB or less for application forms. See the exact result in KB before download; the image is processed in your browser, not uploaded.";

export const metadata: Metadata = pageMetadata({
  title: "Resize Image to 30KB Online – Photo & Signature Under 30 KB",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How can I resize a photo to 30KB?",
    answer:
      "Add your photo; 30 KB is preselected. The tool picks the highest JPG quality that fits and reduces the pixel size only if needed, then shows the real file size.",
  },
  {
    question: "How many pixels is a 30KB photo?",
    answer:
      "It depends on detail, but a head-and-shoulders photo usually stays sharp at about 300–450 pixels wide, enough for any online form.",
  },
  {
    question: "My form says at least 30 KB. What do I do?",
    answer:
      "That's a minimum, not a maximum. RRB's signature, for example, must be 30–49 KB. Use the minimum size field in resize image to KB, or the RRB page, so the file isn't too small.",
  },
  {
    question: "Will a signature look good at 30KB?",
    answer: "Yes. 30 KB is generous for a signature; crop it close and keep the paper white for crisp strokes.",
  },
  {
    question: "Does it work on a phone?",
    answer: "Yes. Pick the photo from your gallery, and the result downloads back to your phone. Nothing is uploaded.",
  },
];

export default function ThirtyKbPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Image to 30KB Online"
      intro={
        <p>
          30 KB is a common middle limit for form photos and signatures. Add your image and get the clearest 30KB file that
          fits, with the size shown before you save it.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Steps to get a photo under 30KB</h2>
          <ol>
            <li>Crop head and shoulders, or the signature, so the file spends its bytes on what matters.</li>
            <li>Add the image; the 30 KB target is already set.</li>
            <li>Zoom into the preview, then download the JPG.</li>
          </ol>

          <h2>Maximums and minimums</h2>
          <p>
            Read the form&apos;s wording: &ldquo;up to 30 KB&rdquo; is a ceiling, but &ldquo;30–49 KB&rdquo;, as on the{" "}
            <Link href="/tools/rrb-photo">RRB signature</Link>, also rejects smaller files. For a range, use{" "}
            <Link href="/tools/resize-image-to-kb">resize image to KB</Link> with a minimum. Tighter limits have the{" "}
            <Link href="/tools/20kb-photo">20KB</Link> page; more room, the <Link href="/tools/50kb-photo">50KB</Link> one.
          </p>

          <PrivacyNote>
            <p>The photo is resized on your device and never sent to a server.</p>
          </PrivacyNote>
        </>
      }
    >
      <TargetSizeTool
        tool="30kb-photo"
        defaultTargetKB={30}
        quickStart
        presetsKB={[20, 25, 30, 40, 50]}
        events={{ started: "kb_photo_started", completed: "kb_photo_completed", downloaded: "photo_downloaded" }}
      />
    </ToolPageShell>
  );
}
