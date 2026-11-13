import type { Metadata } from "next";
import Link from "next/link";
import { PassportPhotoTool } from "@/components/tools/passport-photo-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("200x230-photo");

const description =
  "Resize a photo to 200 × 230 pixels and 20–50 KB, the size IBPS, SBI and Indian Bank forms ask for. Crop with a face guide; your photo isn't uploaded.";

export const metadata: Metadata = pageMetadata({
  title: "Resize Photo to 200x230 Pixels – 20 to 50 KB JPG",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Which forms need a 200 × 230 pixel photo?",
    answer:
      "Bank recruitment forms: IBPS PO, Clerk and SO, SBI PO and Indian Bank Apprentice list 200 × 230 pixels as the preferred size, with a file of 20–50 KB.",
  },
  {
    question: "How do I resize my photo to 200 × 230?",
    answer:
      "Add the photo, place your face inside the guide, and create the file. The tool crops to the 200:230 shape so nothing is stretched, then fits the JPG between 20 and 50 KB.",
  },
  {
    question: "What if my 200 × 230 photo is under 20 KB?",
    answer:
      "A clean photo at that small size can compress very well. The tool raises the JPG quality to reach 20 KB and tells you if it still can't.",
  },
  {
    question: "Is 200 × 230 the same as 4.5 × 3.5 cm?",
    answer:
      "It's the digital version of it. Bank notices give 4.5 cm × 3.5 cm for the printed photo and 200 × 230 pixels for the upload.",
  },
  {
    question: "Is my photo uploaded?",
    answer: "No. Cropping and compression run in your browser, so the photo never leaves your device.",
  },
];

export default function Photo200x230Page() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Photo to 200 × 230 Pixels"
      intro={
        <p>
          Make the 200 × 230 pixel, 20–50 KB JPG that bank recruitment forms prefer. The face guide keeps the head centred and
          the shape exact.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make a 200 × 230 photo</h2>
          <ol>
            <li>Use a recent colour photo on a light, preferably white, background.</li>
            <li>Add it above, fit your face to the guide and create the file.</li>
            <li>Check the result shows 200 × 230 px and a size between 20 and 50 KB, then download.</li>
          </ol>

          <h2>Signature and thumb for the same forms</h2>
          <p>
            These forms also want a <Link href="/tools/140x60-signature">140 × 60 signature</Link> of 10–20 KB and a{" "}
            <Link href="/tools/thumb-impression-resizer">thumb impression</Link>. The official details are on the{" "}
            <Link href="/tools/ibps-photo">IBPS</Link>, <Link href="/tools/sbi-photo">SBI</Link> and{" "}
            <Link href="/tools/indian-bank-photo">Indian Bank</Link> pages.
          </p>

          <PrivacyNote>
            <p>Your photo is cropped and resized on your device, never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <PassportPhotoTool
        tool="200x230-photo"
        units={["px"]}
        defaultCustom={{ unit: "px", width: "200", height: "230", dpi: "300", minKB: "20", maxKB: "50" }}
        presets={false}
      />
    </ToolPageShell>
  );
}
