import type { Metadata } from "next";
import Link from "next/link";
import { PassportPhotoTool } from "@/components/tools/passport-photo-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("600x600-photo");

const description =
  "Make a square 600 × 600 pixel photo, the 2 × 2 inch US passport size at 300 DPI. Crop with a face guide and set a KB limit if needed. Nothing uploaded.";

export const metadata: Metadata = pageMetadata({
  title: "600x600 Pixel Photo – 2x2 Inch Photo Maker Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Is 600 × 600 pixels the same as a 2 × 2 inch photo?",
    answer:
      "Yes, at 300 DPI: 2 inches × 300 = 600 pixels on each side. The US passport photo is 2 × 2 inches, so this file prints at that size.",
  },
  {
    question: "How big should my head be in a 2 × 2 photo?",
    answer:
      "For a US passport, 1 to 1⅜ inches from chin to the top of the head, about half to two-thirds of the photo's height.",
  },
  {
    question: "How do I make a square photo without stretching my face?",
    answer: "The crop box is locked to a square, so you only choose which part of the photo to keep; nothing is squeezed.",
  },
  {
    question: "Can I set a file size limit?",
    answer: "Yes. Enter the maximum KB, and a minimum if the form has one, before you create the photo.",
  },
  {
    question: "Is my photo uploaded?",
    answer: "No. It's cropped and saved by your browser on your device.",
  },
];

export default function Photo600x600Page() {
  return (
    <ToolPageShell
      tool={tool}
      h1="600 × 600 Pixel Photo (2 × 2 Inch)"
      intro={
        <p>
          Crop any photo to a square 600 × 600 pixels, which prints as a 2 × 2 inch photo at 300 DPI, the US passport size.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make a 600 × 600 photo</h2>
          <ol>
            <li>Stand against a plain white or off-white wall, facing the camera, without glasses.</li>
            <li>Add the photo, fit your head inside the guide, and create the file.</li>
            <li>Print at 100% for a 2 × 2 inch photo, or upload the JPG.</li>
          </ol>

          <h2>US passport rules</h2>
          <p>
            The full US requirements, from the State Department&apos;s own form, are in the{" "}
            <Link href="/tools/passport-photo">passport photo maker</Link>, which also makes a print sheet. For a round
            profile picture instead, use <Link href="/tools/circle-crop">circle crop</Link>.
          </p>

          <PrivacyNote>
            <p>Your photo is cropped on your device and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <PassportPhotoTool
        tool="600x600-photo"
        units={["px"]}
        defaultCustom={{ unit: "px", width: "600", height: "600", dpi: "300", minKB: "", maxKB: "" }}
        presets={false}
      />
    </ToolPageShell>
  );
}
