import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("ibps-photo");
const app = APPLICATIONS.ibps;

const description =
  "Make an IBPS photo of 200 × 230 px and 20–50 KB, and a 140 × 60 px, 10–20 KB signature, as stated in the current IBPS CRP notifications. Sources listed.";

export const metadata: Metadata = pageMetadata({
  title: "IBPS Photo, Signature & Thumb Impression Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the IBPS photo size?",
    answer:
      "200 × 230 pixels (preferred), 20–50 KB, JPG/JPEG: a recent colour photo against a light, preferably white, background. This is the same in CRP PO/MT-XVI, CSA-XVI and SPL-XVI.",
  },
  {
    question: "What is the IBPS signature size?",
    answer: "140 × 60 pixels (preferred), 10–20 KB, JPG/JPEG, in black ink on white paper. Capital letters are not accepted.",
  },
  {
    question: "What is the IBPS left thumb impression size?",
    answer:
      "240 × 240 pixels at 200 DPI (3 × 3 cm), 20–50 KB, JPG, in black or blue ink on white paper. Without a left thumb, use the right one.",
  },
  {
    question: "What size is the IBPS hand-written declaration?",
    answer:
      "800 × 400 pixels at 200 DPI (10 × 5 cm), 50–100 KB, JPG. Copy the notification's wording by hand in English, not in capital letters.",
  },
  {
    question: "What if my file doesn't meet the specification?",
    answer:
      "The application won't let you move on until the photo and signature match, and an unclear or smudged face can get the application rejected.",
  },
];

export default function IbpsPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="IBPS Photo Resizer"
      intro={
        <p>
          Pick your IBPS notification and the tool makes the photo, signature, thumb impression and declaration at its stated
          sizes. Not affiliated with IBPS.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your IBPS files</h2>
          <ol>
            <li>Choose PO/MT, CSA (clerk) or Specialist Officers, then pick what you&apos;re preparing.</li>
            <li>Add the image and frame it: head and shoulders for the photo, tight around the ink for the rest.</li>
            <li>
              Select <strong>Create</strong>. If a clean signature lands under 10 KB, accept the offer to enlarge it; the pixel
              size is only &ldquo;preferred&rdquo;.
            </li>
          </ol>

          <h2>Thumb impression and declaration</h2>
          <p>
            Press the left thumb firmly once and lift straight up so the ridges stay sharp; keep the paper clean-up off or
            light. For the declaration, photograph the whole page flat in good light and crop to the text. The wording to copy
            is under &ldquo;Full rules&rdquo; above.
          </p>

          <h2>Avoid these mistakes</h2>
          <ul>
            <li>A dark or patterned background, a cap or dark glasses (religious headwear is fine if the face is clear).</li>
            <li>A signature in capital letters.</li>
            <li>
              A photo that looks different from the live photo the form also captures. Applying to SBI too? It uses the same
              sizes: see the <Link href="/tools/sbi-photo">SBI photo resizer</Link>.
            </li>
          </ul>

          <PrivacyNote>
            <p>All four files are prepared in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="IBPS Photo and Signature Size Requirements" app={app} />
        <RequirementPhotoTool tool="ibps-photo" sets={app.sets} setLabel="IBPS notification" appName="IBPS" />
      </div>
    </ToolPageShell>
  );
}
