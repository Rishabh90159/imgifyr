import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("upessc-photo");
const app = APPLICATIONS.upessc;

const description =
  "UPESSC's myOTR asks for a photo, signature and hand-written declaration, each a JPG or PNG of 10–100 KB, for UP TGT 2026 and every UPESSC exam. Make them here.";

export const metadata: Metadata = pageMetadata({
  title: "UPESSC Photo & Signature Size – UP TGT OTR Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the UP TGT 2026 photo and signature size?",
    answer:
      "Both are uploaded in the UPESSC One Time Registration, not the TGT form: each a JPG or PNG of 10–100 KB. No pixel size is given.",
  },
  {
    question: "What is the UPESSC hand-written declaration?",
    answer:
      "The OTR Documents page shows a declaration. Copy it by hand on white paper and upload a photo or scan of it as a 10–100 KB JPG or PNG.",
  },
  {
    question: "Is UPESSC the same as UPSSSC?",
    answer:
      "No. UPESSC (upessc.up.gov.in) recruits teachers, lecturers, principals and headmasters. UPSSSC has its own OTR and limits.",
  },
  {
    question: "Does UPESSC take a live photo as well?",
    answer:
      "Yes, when you create the account (camera, or a phone via “Live QR”). It's used on the admit card; the passport-size photo is uploaded separately in the OTR.",
  },
  {
    question: "Do I upload a new photo for each UPESSC exam?",
    answer:
      "No. TGT (07/2026), Principal (08/2026) and Headmaster (09/2026) reuse the OTR files and only add certificate PDFs of 20–200 KB.",
  },
];

export default function UpesscPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="UPESSC (UP TGT) Photo, Signature and Declaration Size"
      intro={
        <p>
          Make the three images every UPESSC application uses, including UP TGT 2026. Not affiliated with the Uttar Pradesh
          Education Services Selection Commission.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your UPESSC files</h2>
          <ol>
            <li>
              <strong>Photograph:</strong> plain, well-lit background, face and both ears visible, no cap or dark glasses. Crop
              head to shoulders.
            </li>
            <li>
              <strong>Signature:</strong> dark ink on white paper, cropped close.
            </li>
            <li>
              <strong>Declaration:</strong> write out the text the portal shows, photograph the page flat and crop to the
              writing.
            </li>
          </ol>
          <p>Each file must be 10–100 KB. The tool saves JPG, which the portal accepts.</p>

          <h2>Open applications</h2>
          <ul>
            <li>
              <strong>TGT (07/2026):</strong> until 23 November 2026.
            </li>
            <li>
              <strong>Principal (08/2026) and Headmaster (09/2026):</strong> until 22 November 2026.
            </li>
          </ul>
          <p>
            Certificates for these forms are PDFs of 20–200 KB; the <Link href="/tools/compress-pdf">PDF compressor</Link> can
            shrink a large scan.
          </p>

          <PrivacyNote>
            <p>The three UPESSC images are processed locally; none is sent to this site.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="UPESSC Photo, Signature and Declaration Size at a Glance" app={app} />
        <RequirementPhotoTool tool="upessc-photo" sets={app.sets} setLabel="UPESSC registration" appName="UPESSC" />
      </div>
    </ToolPageShell>
  );
}
