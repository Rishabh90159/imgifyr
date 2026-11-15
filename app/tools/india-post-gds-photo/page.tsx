import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("india-post-gds-photo");
const app = APPLICATIONS.gds;

const description =
  "India Post GDS asks for a 320 × 400 px photo of 30–100 KB and a 300 × 120 px signature of 20–100 KB, both JPG. Make both files here, free.";

export const metadata: Metadata = pageMetadata({
  title: "GDS Photo Size & Signature Size – India Post GDS Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the India Post GDS photo size?",
    answer:
      "A JPG/JPEG of 30–100 KB, 320 × 400 pixels recommended (4:5 shape), 72–150 DPI, on a plain white or light background with your face filling 70–80% of the photo.",
  },
  {
    question: "What is the GDS signature size?",
    answer:
      "A JPG/JPEG of 20–100 KB, 300 × 120 pixels recommended (5:2 shape), 72–150 DPI, signed in black or blue pen on white paper.",
  },
  {
    question: "Why is my GDS signature under 20 KB?",
    answer:
      "A clean 300 × 120 signature compresses to a few KB. The size is only recommended, so press \"Make it larger\": the tool keeps the 5:2 shape and raises the size until it reaches 20 KB.",
  },
  {
    question: "Can I upload a selfie for GDS?",
    answer: "No. India Post asks you not to upload selfies or scanned photos; use a clear, well-lit, in-focus photo.",
  },
  {
    question: "Can I change the photo after submitting?",
    answer: "No. Check the preview carefully: no correction or replacement is allowed after final submission.",
  },
];

export default function IndiaPostGdsPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="India Post GDS Photo Size and Signature Size"
      intro={
        <p>
          Make the photo and signature for the Gramin Dak Sevak (BPM, ABPM, Dak Sevak) application. Not affiliated with
          India Post.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your GDS files</h2>
          <ol>
            <li>
              <strong>Photo:</strong> stand against a plain light wall and crop in the 4:5 box so your face fills most of it.
              A busy background? Try the <Link href="/tools/white-background-photo">white background tool</Link>.
            </li>
            <li>
              <strong>Signature:</strong> black or blue pen on white paper, cropped in the 5:2 box so the ink fills most of
              it, with no border.
            </li>
          </ol>
          <p>The tool saves JPGs at 150 DPI in the recommended sizes, inside the 30–100 KB and 20–100 KB ranges.</p>

          <h2>Older size limits online</h2>
          <p>
            Some websites still list older, smaller limits for GDS. The sizes on this page come from India Post&apos;s own
            instructions, linked above.
          </p>

          <PrivacyNote>
            <p>Your GDS photo and signature are processed in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementPhotoTool tool="india-post-gds-photo" sets={app.sets} setLabel="GDS engagement" appName="India Post GDS" />
        <RequirementSummary heading="India Post GDS Photo and Signature Size at a Glance" app={app} />
      </div>
    </ToolPageShell>
  );
}
