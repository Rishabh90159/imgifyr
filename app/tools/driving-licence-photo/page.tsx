import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("driving-licence-photo");
const app = APPLICATIONS.sarathi;

const description =
  "Sarathi driving licence photo: 420 × 525 px, 10–20 KB JPG; signature 256 × 64 px, 10–20 KB. Make both from Parivahan's official spec, free, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Driving Licence Photo & Signature Size – Sarathi Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the photo size for a driving licence application?",
    answer:
      "On Sarathi: a JPG of 420 × 525 pixels (preferred), 10–20 KB, a recent colour passport-size photo on a light, preferably white, background.",
  },
  {
    question: "What is the Sarathi signature size?",
    answer: "256 × 64 pixels (preferred), 10–20 KB, JPG, signed with a black pen on white paper.",
  },
  {
    question: "Does it work for a learner's licence too?",
    answer: "Yes. Learner's and driving licence applications on Sarathi use the same photo and signature upload.",
  },
  {
    question: "Why does the upload page not ask for my photo?",
    answer:
      "Some states fetch the photo from your Aadhaar through e-KYC. Services differ by state, so follow what your state's screen shows.",
  },
  {
    question: "Is my photo uploaded to this site?",
    answer: "No. Both files are made in your browser and never leave your device.",
  },
];

export default function DrivingLicencePhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Driving Licence Photo and Signature Size (Sarathi)"
      intro={
        <p>
          Make the photo and signature for a driving or learner&apos;s licence application on Parivahan Sarathi. Not
          affiliated with the Ministry of Road Transport &amp; Highways.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your Sarathi files</h2>
          <ol>
            <li>
              <strong>Photograph:</strong> a recent colour photo on a light wall, no cap or dark glasses; the tool saves 420 ×
              525 px between 10 and 20 KB.
            </li>
            <li>
              <strong>Signature:</strong> black pen on white paper, cropped close; saved at 256 × 64 px, 10–20 KB.
            </li>
          </ol>

          <h2>If a file is rejected</h2>
          <p>
            Check it is a JPG and between 10 and 20 KB: a very clean photo can come out too small, and the tool then offers to
            enlarge it. For a background that isn&apos;t white, use the{" "}
            <Link href="/tools/white-background-photo">white background tool</Link> first.
          </p>

          <PrivacyNote>
            <p>Your photo and signature are processed in your browser, never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="Sarathi Photo and Signature Size at a Glance" app={app} />
        <RequirementPhotoTool tool="driving-licence-photo" sets={app.sets} setLabel="Application" appName="Sarathi" />
      </div>
    </ToolPageShell>
  );
}
