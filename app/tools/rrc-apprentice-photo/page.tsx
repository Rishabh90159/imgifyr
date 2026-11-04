import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("rrc-apprentice-photo");
const app = APPLICATIONS.rrc;

const description =
  "Central Railway Act Apprentice 2026 asks for a 3.5 × 3.5 cm photo (20–70 KB) and signature (20–30 KB), JPG at 100 DPI. Make both files here, free.";

export const metadata: Metadata = pageMetadata({
  title: "Railway Apprentice Photo Size – RRC Central Railway 2026",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the RRC CR Apprentice 2026 photo size?",
    answer:
      "A colour photo of 3.5 cm × 3.5 cm, JPG/JPEG, 100 DPI, 20–70 KB, taken in the last three months, front view, no cap or sunglasses.",
  },
  {
    question: "What is the railway apprentice signature size?",
    answer: "3.5 cm × 3.5 cm, JPG/JPEG, 100 DPI, with a file size between 20 KB and 30 KB.",
  },
  {
    question: "Is this the same as the RRB signature?",
    answer:
      "No. RRB NTPC and Station Master want a 30–49 KB signature of at least 140 × 60 pixels. This Central Railway apprentice notice uses a square 3.5 cm signature of 20–30 KB.",
  },
  {
    question: "Which other documents are uploaded?",
    answer:
      "10th mark sheet, date of birth proof, ITI mark sheet, NCVT/SCVT trade certificate, and caste, PwBD or ex-serviceman certificates if they apply. The notice sets no size for them.",
  },
  {
    question: "How many apprentice slots are there?",
    answer: "2,861 slots across Central Railway workshops and units. Apply only on rrccr.com.",
  },
];

export default function RrcApprenticePhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Central Railway Apprentice 2026 Photo and Signature Size"
      intro={
        <p>
          Make the square photo and signature for RRC Central Railway&apos;s Act Apprentice application. Not affiliated with
          Indian Railways.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your apprentice files</h2>
          <ol>
            <li>
              <strong>Photograph:</strong> a recent colour photo, face straight to the camera. The crop is square to match
              3.5 × 3.5 cm.
            </li>
            <li>
              <strong>Signature:</strong> sign on white paper and crop it square with white space around the ink.
            </li>
          </ol>
          <p>
            Both files are saved as JPG at 100 DPI. To shrink a large certificate scan, use{" "}
            <Link href="/tools/resize-image-to-kb">resize image to KB</Link> or the{" "}
            <Link href="/tools/compress-pdf">PDF compressor</Link>.
          </p>

          <h2>Application dates</h2>
          <p>
            Notification RRC/CR/AA/2026: apply online from 3 November to 2 December 2026, until 5 pm. Keep two extra copies
            of the photo for document verification.
          </p>

          <PrivacyNote>
            <p>The photo and signature are prepared in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="Central Railway Apprentice Photo and Signature Size at a Glance" app={app} />
        <RequirementPhotoTool tool="rrc-apprentice-photo" sets={app.sets} setLabel="RRC notification" appName="RRC/CR" />
      </div>
    </ToolPageShell>
  );
}
