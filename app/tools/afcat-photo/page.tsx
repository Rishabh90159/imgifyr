import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("afcat-photo");
const app = APPLICATIONS.afcat;

const description =
  "AFCAT 01/2027 asks for a 100–200 KB photo, an 80–150 KB signature and a 50–100 KB thumb impression, all JPG with set file names. Make all three here, free.";

export const metadata: Metadata = pageMetadata({
  title: "AFCAT Photo Size 2027 – Signature & Thumb Impression Size",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the AFCAT photo size?",
    answer:
      "A recent passport-size colour photo with a light background, JPG/JPEG, between 100 KB and 200 KB, named Passport Photograph.jpg. The notification gives no pixel size.",
  },
  {
    question: "What is the AFCAT signature size?",
    answer: "A JPG/JPEG between 80 KB and 150 KB, named Signature.jpg. Sign in black ink on white paper and scan only the signature area.",
  },
  {
    question: "Which thumb do I use for AFCAT?",
    answer:
      "Men upload the left thumb and women the right thumb, pressed on an ink pad and then on plain paper. The file must be 50–100 KB and named Thumb Impression.jpg.",
  },
  {
    question: "Why is my AFCAT signature under 80 KB?",
    answer:
      "Signatures compress very well, so 80 KB is high for one. The tool raises the quality to reach the minimum; if it still falls short, use a higher-resolution scan with a little more margin.",
  },
  {
    question: "Is there a live photo in the AFCAT form?",
    answer: "Yes. Besides the uploads, the form captures a live image of you through your device camera.",
  },
];

export default function AfcatPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="AFCAT Photo Size, Signature and Thumb Impression (01/2027)"
      intro={
        <p>
          Make the three uploads for the AFCAT 01/2027 application, saved under the file names the notification asks for.
          Not affiliated with the Indian Air Force.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your AFCAT files</h2>
          <ol>
            <li>
              <strong>Photograph:</strong> face the camera against a light wall, no headgear (except for Sikhs). Use the{" "}
              <Link href="/tools/white-background-photo">white background tool</Link> if the wall is busy.
            </li>
            <li>
              <strong>Signature:</strong> black ink on white paper, cropped to the signature with a small margin.
            </li>
            <li>
              <strong>Thumb impression:</strong> left thumb for men, right for women, pressed on an ink pad and then on
              plain paper.
            </li>
          </ol>
          <p>
            Each file downloads already named Passport Photograph.jpg, Signature.jpg or Thumb Impression.jpg, inside its
            KB range.
          </p>

          <h2>Application dates</h2>
          <p>
            Apply on afcat.edcil.co.in from 12 November to 11 December 2026 (11:30 pm). The online exam is on 31 January
            2027.
          </p>

          <PrivacyNote>
            <p>All three AFCAT images are processed in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="AFCAT Photo, Signature and Thumb Size at a Glance" app={app} />
        <RequirementPhotoTool tool="afcat-photo" sets={app.sets} setLabel="AFCAT notification" appName="AFCAT" />
      </div>
    </ToolPageShell>
  );
}
