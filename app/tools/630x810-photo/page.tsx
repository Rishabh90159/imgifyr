import type { Metadata } from "next";
import Link from "next/link";
import { PassportPhotoTool } from "@/components/tools/passport-photo-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("630x810-photo");

const description =
  "Resize a photo to exactly 630 × 810 pixels, a high-resolution 7:9 passport-style photo, with an optional KB limit. Free, in your browser, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Resize Photo to 630x810 Pixels Online – Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What shape is a 630 × 810 photo?",
    answer:
      "A 7:9 portrait, the same proportion as a 3.5 × 4.5 cm passport photo, at a higher pixel count than the usual 413 × 531.",
  },
  {
    question: "How do I resize a photo to 630 × 810 pixels?",
    answer:
      "Add the photo, frame your head inside the guide and create the file. The crop is locked to 630:810, so the face is never stretched.",
  },
  {
    question: "My form also gives a KB limit. Can I set it?",
    answer: "Yes. Type the maximum, and the minimum if there is one, before creating the file; the result shows the exact size.",
  },
  {
    question: "Will a small photo look blurry at 630 × 810?",
    answer:
      "If the original is smaller than 630 × 810, it has to be enlarged and may look soft. Start from your phone's original photo, not a WhatsApp copy.",
  },
  {
    question: "Is my photo uploaded?",
    answer: "No. The photo is cropped and saved on your own device.",
  },
];

export default function Photo630x810Page() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Photo to 630 × 810 Pixels"
      intro={
        <p>
          Some portals ask for a 630 × 810 pixel photo: a sharper version of the 3.5 × 4.5 cm passport shape. Crop yours to
          it, with a KB limit if needed.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Steps for a 630 × 810 photo</h2>
          <ol>
            <li>Start from the original camera photo for the best sharpness.</li>
            <li>Add it, centre your face in the guide, and enter the form&apos;s KB limit if it has one.</li>
            <li>Check the result reads 630 × 810 px, then download the JPG.</li>
          </ol>

          <h2>Other common photo sizes</h2>
          <p>
            For the printed passport size, use the <Link href="/tools/413x531-photo">413 × 531 photo</Link>; for bank forms,
            the <Link href="/tools/200x230-photo">200 × 230 photo</Link>. Any other pixel size works in the{" "}
            <Link href="/tools/passport-photo-resizer">passport photo resizer</Link>.
          </p>

          <PrivacyNote>
            <p>The photo is resized in your browser and never sent anywhere.</p>
          </PrivacyNote>
        </>
      }
    >
      <PassportPhotoTool
        tool="630x810-photo"
        units={["px"]}
        defaultCustom={{ unit: "px", width: "630", height: "810", dpi: "300", minKB: "", maxKB: "" }}
        presets={false}
      />
    </ToolPageShell>
  );
}
