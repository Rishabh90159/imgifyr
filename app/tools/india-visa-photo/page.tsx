import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("india-visa-photo");
const app = APPLICATIONS.indiaVisa;

const description =
  "Indian visa photo size from the official visa site: a square JPEG, 350 × 350 to 1000 × 1000 pixels, 10–300 KB. Make yours free; it never leaves your device.";

export const metadata: Metadata = pageMetadata({
  title: "Indian Visa Photo Size – Square JPEG, 10–300 KB, Free Maker",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What are the India visa photo requirements?",
    answer:
      "The visa site's photo guide asks for a JPEG of 10 KB to 300 KB whose height and width are equal: at least 350 × 350 and at most 1000 × 1000 pixels.",
  },
  {
    question: "What photo does the India e-Visa need?",
    answer:
      "The e-Visa page asks for a recent, front-facing photograph with a white background, uploaded with your passport's photo page. Its public pages state no pixel or KB limits, so check the form's upload screen.",
  },
  {
    question: "Why is my Indian visa photo rejected?",
    answer:
      "The published checks fail a photo that isn't square, is outside 350–1000 pixels, or is over 300 KB. Phone photos are often several MB: crop it square here and it is saved within the limits.",
  },
  {
    question: "Can I take the photo with my phone?",
    answer:
      "Yes. The guide accepts a digital camera or webcam photo, or a scanned print. Stand in front of a plain white wall, facing the camera in even light.",
  },
  {
    question: "Is my photo uploaded to this site?",
    answer: "No. The photo is cropped and resized in your browser and never leaves your device.",
  },
];

export default function IndiaVisaPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Indian Visa Photo Size and Requirements"
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Indian visa photo resize in three steps</h2>
          <ol>
            <li>Take a front-facing photo against a plain white wall, in daylight.</li>
            <li>
              Add it above and frame your head and shoulders in the square. Busy background? Use the{" "}
              <Link href="/tools/white-background-photo">white background tool</Link> first.
            </li>
            <li>Download the JPG: 350 × 350 pixels, between 10 KB and 300 KB.</li>
          </ol>

          <h2>India e-Visa photo</h2>
          <p>
            A square photo made here against a white background also matches what the e-Visa page asks for: front-facing, white background.
            The e-Visa form shows its own limits at the upload step, so compare them before you submit. For a passport photo
            for another country, see <Link href="/tools/passport-photo">passport size photo by country</Link>.
          </p>

          <PrivacyNote>
            <p>Your visa photo is processed in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementPhotoTool tool="india-visa-photo" sets={app.sets} setLabel="Application" appName="Indian visa" />
        <RequirementSummary heading="Indian Visa Photo Size at a Glance" app={app} />
      </div>
    </ToolPageShell>
  );
}
