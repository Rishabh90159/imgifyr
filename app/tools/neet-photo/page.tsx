import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("neet-photo");
const app = APPLICATIONS.neet;

const description =
  "Prepare your NEET (UG) photo as a JPG of 10–200 KB and your signature within 10–100 KB, following the NTA information bulletin. Source and check date shown.";

export const metadata: Metadata = pageMetadata({
  title: "NEET Photo Resizer – Photo Size & Upload Requirements",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the NEET photo size?",
    answer:
      "A JPG/JPEG of 10–200 KB: a recent passport-size photo on a white background, face about 80% of the image, ears visible, no mask. The NEET (UG) 2026 bulletin gives no pixel size.",
  },
  {
    question: "What is the NEET signature size?",
    answer: "A JPG/JPEG between 10 KB and 100 KB.",
  },
  {
    question: "Do NEET photo requirements change every year?",
    answer: "They can: NTA publishes a new bulletin each cycle. This page shows the latest one we've verified and when we checked it.",
  },
  {
    question: "Can I edit my NEET photo?",
    answer:
      "Cropping and resizing are fine. Polaroid or computer-generated photos are not accepted, and fabricated photos are treated as unfair means, so avoid filters and background replacement.",
  },
  {
    question: "Do I need printed photos for NEET?",
    answer:
      "Yes. Use the same photo for the form and the attendance sheet, and keep 6–8 passport-size and 4–6 postcard-size (4\" × 6\") prints with a white background.",
  },
];

export default function NeetPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="NEET Photo Resizer"
      intro={<p>Make your NEET (UG) photo and signature within NTA&apos;s limits, as JPGs. Not affiliated with NTA.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your NEET photo and signature</h2>
          <ol>
            <li>Take a recent photo against a white wall in good light, without a mask, ears showing.</li>
            <li>
              With <strong>Photograph</strong> selected, crop so your face fills about 80% of the frame and create the file.
            </li>
            <li>Switch to <strong>Signature</strong>, add your signed paper, crop tightly and create the second file.</li>
          </ol>

          <h2>Avoid these mistakes</h2>
          <ul>
            <li>A half-body photo: the face must fill about 80% of the image.</li>
            <li>A photo taken before 1 January 2026, or spectacles you don&apos;t usually wear.</li>
            <li>
              Looking different from the live photo, which is matched with your Aadhaar. Applying for JEE Main too? See the{" "}
              <Link href="/tools/jee-main-photo">JEE Main photo and signature page</Link>.
            </li>
          </ul>

          <PrivacyNote>
            <p>Your NEET photo and signature are prepared on your device and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="NEET Photo and Signature Size Requirements" app={app} />
        <RequirementPhotoTool tool="neet-photo" sets={app.sets} setLabel="Information bulletin" appName="NEET" />
      </div>
    </ToolPageShell>
  );
}
