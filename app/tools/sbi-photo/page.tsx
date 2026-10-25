import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("sbi-photo");
const app = APPLICATIONS.sbi;

const description =
  "Resize your photo and signature for an SBI recruitment application. Pick your advertisement to apply its stated size (200 × 230 px, 20–50 KB) with the source.";

export const metadata: Metadata = pageMetadata({
  title: "SBI Photo, Signature & Thumb Impression Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the SBI photo size for recruitment applications?",
    answer:
      "Both current advertisements (PO CRPD/PO/2026-27/09 and Resolvers CRPD/RS/2026-27/06) ask for a recent colour photo of 200 × 230 pixels (preferred), 20–50 KB, on a light, preferably white, background.",
  },
  {
    question: "What size should my SBI signature be?",
    answer: "140 × 60 pixels (preferred), 10–20 KB, in black ink on white paper. Capital letters are not accepted.",
  },
  {
    question: "What is the SBI left thumb impression size?",
    answer:
      "For SBI PO 2026: 240 × 240 pixels at 200 DPI (3 × 3 cm), 20–50 KB, JPG, in black or blue ink. Without a left thumb you may use the right.",
  },
  {
    question: "What should the SBI hand-written declaration say?",
    answer:
      "“I ______ (Name of the candidate), ______ (Date of Birth) hereby declare that all the information submitted by me in the application form is correct, true and valid. I will present the supporting documents as and when required. The signature, photograph and left-hand thumb impression is of mine.” Handwritten in English, not in capitals, 800 × 400 px, 50–100 KB.",
  },
  {
    question: "What happens if the photo doesn't match on exam day?",
    answer:
      "The PO 2026 advertisement says a mismatch with the photo or signature on the call letter or attendance sheet means disqualification. Keep about 8 copies of the same photo.",
  },
];

export default function SbiPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="SBI Photo Resizer"
      intro={
        <p>
          Pick your SBI advertisement and the tool makes each file at the size it states. Not affiliated with State Bank of
          India.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your SBI files</h2>
          <ol>
            <li>Choose the advertisement you&apos;re applying under; its sizes appear in the table above.</li>
            <li>Pick Photograph, Signature, Thumb impression or Declaration, add the image and crop it.</li>
            <li>Create the file. If it&apos;s under the minimum KB, the checklist offers to enlarge it slightly.</li>
          </ol>

          <h2>Thumb impression and declaration (SBI PO)</h2>
          <p>
            Ink the left thumb, press once on white paper and keep the clean-up off or low so the ridge lines stay visible.
            Copy SBI&apos;s declaration by hand in black ink; note that it includes your date of birth, unlike the IBPS
            wording.
          </p>

          <h2>Avoid these mistakes</h2>
          <ul>
            <li>Using a different photo at a later stage; it must match the uploaded one.</li>
            <li>Glare on glasses, harsh shadows or a capital-letter signature.</li>
            <li>
              Forgetting the live photo the PO form also captures. Applying to IBPS too? Same sizes: see the{" "}
              <Link href="/tools/ibps-photo">IBPS photo resizer</Link>.
            </li>
          </ul>

          <PrivacyNote>
            <p>Your photo, signature, thumb impression and declaration stay on your device.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="SBI Photo and Signature Size Requirements" app={app} />
        <RequirementPhotoTool tool="sbi-photo" sets={app.sets} setLabel="SBI advertisement" appName="SBI" />
      </div>
    </ToolPageShell>
  );
}
