import type { Metadata } from "next";
import Link from "next/link";
import { PassportPhotoTool } from "@/components/tools/passport-photo-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("413x531-photo");

const description =
  "Resize a photo to 413 × 531 pixels, the 3.5 × 4.5 cm passport size at 300 DPI, ready to print or upload. Add a KB limit if your form has one. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "413x531 Pixels Photo – 3.5 x 4.5 cm Passport Size",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is 413 × 531 pixels in cm?",
    answer:
      "3.5 × 4.5 cm (35 × 45 mm) at 300 DPI. It's the printed passport-photo size used in India, the UK and for Schengen visas.",
  },
  {
    question: "Why 300 DPI?",
    answer:
      "Photo labs print at 300 DPI. The tool writes 300 DPI into the JPG, so it prints at exactly 3.5 × 4.5 cm at 100% scale.",
  },
  {
    question: "Can I upload a 413 × 531 photo to an online form?",
    answer:
      "Yes, if the form accepts that size. Type its KB limit, such as 50 KB, into the max file size and the tool fits the JPG under it.",
  },
  {
    question: "How do I print several copies?",
    answer:
      "The passport photo maker builds a print sheet: 8 photos on 4 × 6 inch photo paper, or 30 on A4.",
  },
  {
    question: "Is my photo uploaded?",
    answer: "No. Everything happens in your browser, so the photo stays on your device.",
  },
];

export default function Photo413x531Page() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Photo to 413 × 531 Pixels (3.5 × 4.5 cm)"
      intro={
        <p>
          413 × 531 pixels is a 3.5 × 4.5 cm passport photo at 300 DPI. Crop your photo to it here, for print or for an
          upload with a KB limit.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to make a 413 × 531 photo</h2>
          <ol>
            <li>Take the photo against a plain, light wall, looking straight at the camera.</li>
            <li>Add it, fit your head inside the guide, and add a KB limit only if the form gives one.</li>
            <li>Download, then print at 100% scale or upload it.</li>
          </ol>

          <h2>Country rules and print sheets</h2>
          <p>
            Background and head size differ by country. The <Link href="/tools/passport-photo">passport photo maker</Link>{" "}
            has the official rules for India, the UK, Schengen visas and more, plus a print sheet. For other centimetre sizes,
            use <Link href="/tools/resize-image-in-cm">resize image in cm</Link>.
          </p>

          <PrivacyNote>
            <p>Your passport photo is processed in your browser and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <PassportPhotoTool
        tool="413x531-photo"
        units={["px"]}
        defaultCustom={{ unit: "px", width: "413", height: "531", dpi: "300", minKB: "", maxKB: "" }}
        presets={false}
      />
    </ToolPageShell>
  );
}
