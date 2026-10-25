import type { Metadata } from "next";
import Link from "next/link";
import { ImageQualityEnhancerTool } from "@/components/tools/image-quality-enhancer-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("image-quality-enhancer");

const description =
  "Enhance image quality in your browser: auto levels, brightness, contrast, colour, clarity and sharpening, with a live before-and-after preview. Free, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Image Quality Enhancer – Improve Photo Quality Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What does the image quality enhancer do?",
    answer:
      "It applies classic photo corrections: auto levels for faded tones, brightness and contrast, saturation and warmth, clarity for mid-tone detail, and sharpening. Auto enhance gives a balanced starting point you can adjust.",
  },
  {
    question: "Is this an AI photo enhancer?",
    answer:
      "No. Each adjustment is a standard image-processing operation controlled by a slider, so nothing is invented. Results are predictable, but it can't rebuild faces or lost detail the way AI restoration tries to.",
  },
  {
    question: "Can it fix a blurry photo?",
    answer:
      "Sharpen and Clarity make a slightly soft photo look crisper. Strong motion blur or a badly out-of-focus shot can't be fixed, because the detail was never captured.",
  },
  {
    question: "What are good settings to start with?",
    answer:
      "Start with Auto enhance. For dark indoor shots, raise Brightness to +20–40; for hazy landscapes, add Clarity; for portraits, keep Clarity and Sharpen under about 40 so skin doesn't look harsh.",
  },
  {
    question: "Is enhancement the same as upscaling?",
    answer:
      "No. Enhancement changes how the existing pixels look; upscaling adds pixels to make the image bigger. If you need both, enhance first, then upscale.",
  },
  {
    question: "Are my photos uploaded?",
    answer: "No. The preview and the final image are both processed by your browser.",
  },
];

export default function ImageQualityEnhancerPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Image Quality Enhancer"
      intro={
        <p>
          Improve photo quality when a shot looks dull, dark, hazy or slightly soft. Start with Auto enhance, fine-tune with
          sliders and compare before and after, all in your browser.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to enhance image quality</h2>
          <ol>
            <li>Add a JPG, PNG, WebP or HEIC photo; Auto enhance is applied to the preview.</li>
            <li>Drag the divider to compare, and adjust any slider.</li>
            <li>Select <strong>Create full-size image</strong>, then download.</li>
          </ol>

          <h2>What each slider corrects</h2>
          <ul>
            <li><strong>Auto levels</strong>: grey or faded photos, by stretching tones from black to white.</li>
            <li><strong>Brightness, contrast</strong>: under- or over-exposure and flat lighting.</li>
            <li><strong>Saturation, warmth</strong>: washed-out colours and indoor colour casts.</li>
            <li>
              <strong>Clarity, sharpen</strong>: texture via local contrast, and an unsharp mask on brightness only so edges
              don&apos;t colour-fringe.
            </li>
          </ul>

          <h2>Limits of this photo enhancer</h2>
          <p>
            Heavy blur, strong noise in very dark shots (keep Sharpen low there) and blocky compression artefacts stay. For
            missing resolution, enlarge with the <Link href="/tools/image-upscaler">image upscaler</Link>.
          </p>

          <h2>Output</h2>
          <p>
            Dimensions stay the same and the format is kept (HEIC becomes JPG). The file may grow slightly; reduce it with the{" "}
            <Link href="/tools/image-compressor">image compressor</Link>, or change dimensions with the{" "}
            <Link href="/tools/image-resizer">image resizer</Link>.
          </p>

          <PrivacyNote>
            <p>All adjustments run on your device. Your photos aren&apos;t uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <ImageQualityEnhancerTool />
    </ToolPageShell>
  );
}
