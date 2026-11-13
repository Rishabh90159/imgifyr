import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("voter-id-photo");
const app = APPLICATIONS.eci;

const description =
  "Voter ID photo for Form 6 or Form 8: 4.5 × 3.5 cm passport size, white background, JPG up to 2 MB, per the Election Commission. Make it free, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Voter ID Photo Size – Form 6 Photo Resizer (ECI)",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the photo size for a voter ID application?",
    answer:
      "The Election Commission asks for a passport-size colour photo of 4.5 × 3.5 cm on a white background, uploaded as a JPG or JPEG of up to 2 MB.",
  },
  {
    question: "Is there a pixel size for the voter ID photo?",
    answer: "No. ECI gives only the print size, white background, format and 2 MB limit. The tool keeps the 4.5 × 3.5 cm shape.",
  },
  {
    question: "Do I upload a signature for Form 6?",
    answer: "No. Form 6 asks for the photograph, and the photo must be unsigned.",
  },
  {
    question: "Which form changes the photo on my voter ID?",
    answer: "Form 8. Its photo rule is the same: colour, 4.5 × 3.5 cm, white background, JPG up to 2 MB.",
  },
  {
    question: "Is my photo uploaded here?",
    answer: "No. The photo is cropped and saved in your browser, on your own device.",
  },
];

export default function VoterIdPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Voter ID Photo Size (Form 6 and Form 8)"
      intro={
        <p>
          Make the white-background, 4.5 × 3.5 cm photo for a new voter ID or a photo change. Not affiliated with the Election
          Commission of India.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your voter ID photo</h2>
          <ol>
            <li>Stand against a white wall, face the camera with eyes open and both sides of your face visible.</li>
            <li>Add the photo above and frame your head inside the guide; the crop keeps the 4.5 × 3.5 cm shape.</li>
            <li>Download the JPG and upload it on voters.eci.gov.in or the Voter Helpline app.</li>
          </ol>

          <h2>Background not white?</h2>
          <p>
            ECI asks for a white background. Turn a plain wall white with the{" "}
            <Link href="/tools/white-background-photo">white background tool</Link>, then bring the photo back here. For a
            printed passport-size photo, use the <Link href="/tools/413x531-photo">413 × 531 photo</Link>.
          </p>

          <PrivacyNote>
            <p>Your photo never leaves your device.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="Voter ID Photo Size at a Glance" app={app} />
        <RequirementPhotoTool tool="voter-id-photo" sets={app.sets} setLabel="Form" appName="Voter ID" />
      </div>
    </ToolPageShell>
  );
}
