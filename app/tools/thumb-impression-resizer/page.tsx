import type { Metadata } from "next";
import Link from "next/link";
import { PassportPhotoTool } from "@/components/tools/passport-photo-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("thumb-impression-resizer");

const description =
  "Resize a left thumb impression to 240 × 240 pixels and 20–50 KB, the size bank recruitment forms ask for, or any size. Free, in your browser, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Thumb Impression Resizer – 240x240, 20 to 50 KB",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the thumb impression size for bank exams?",
    answer:
      "IBPS, SBI and Indian Bank ask for 240 × 240 pixels at 200 DPI (3 × 3 cm), JPG, 20–50 KB. The exam pages link the official notices.",
  },
  {
    question: "How do I take a clear thumb impression?",
    answer:
      "Press your left thumb on an ink pad, then once on plain white paper, rolling slightly. Photograph it from above in daylight, without shadow.",
  },
  {
    question: "Which ink colour should I use?",
    answer: "Black or blue ink on white paper, as the bank notices state.",
  },
  {
    question: "My form gives a different size. Can I change it?",
    answer: "Yes. Change the width, height and KB limits before creating the file; the crop follows the new shape.",
  },
  {
    question: "Is the image uploaded?",
    answer: "No. Your thumb impression is processed in your browser and stays on your device.",
  },
];

export default function ThumbImpressionResizerPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Thumb Impression Resizer"
      intro={
        <p>
          Turn a photo of your left thumb impression into the square 240 × 240 pixel, 20–50 KB JPG bank forms ask for, or
          set your form&apos;s own size.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your thumb impression file</h2>
          <ol>
            <li>Make one clean impression in black or blue ink on white paper.</li>
            <li>Photograph it flat from above, add it here and crop close to the print.</li>
            <li>Create the file and check it shows 240 × 240 px and 20–50 KB.</li>
          </ol>

          <h2>Forms that ask for it</h2>
          <p>
            The <Link href="/tools/ibps-photo">IBPS</Link>, <Link href="/tools/sbi-photo">SBI</Link> and{" "}
            <Link href="/tools/indian-bank-photo">Indian Bank</Link> pages show the official wording, including which finger
            to use without a left thumb. The same forms need a <Link href="/tools/140x60-signature">140 × 60 signature</Link>{" "}
            and a <Link href="/tools/200x230-photo">200 × 230 photo</Link>.
          </p>

          <PrivacyNote>
            <p>Your thumb impression never leaves your device.</p>
          </PrivacyNote>
        </>
      }
    >
      <PassportPhotoTool
        tool="thumb-impression-resizer"
        units={["px"]}
        defaultCustom={{ unit: "px", width: "240", height: "240", dpi: "200", minKB: "20", maxKB: "50" }}
        presets={false}
        guide="thirds"
      />
    </ToolPageShell>
  );
}
