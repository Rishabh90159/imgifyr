import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("rrb-photo");
const app = APPLICATIONS.rrb;

const description =
  "RRB NTPC 2026 (CEN 06/2026 and 07/2026) takes your photo live, so only the signature is uploaded: a 30–49 KB JPG of at least 140 × 60 px. Make it here.";

export const metadata: Metadata = pageMetadata({
  title: "RRB NTPC Photo & Signature Size 2026 – Signature Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the RRB NTPC 2026 photo size?",
    answer:
      "There's no photo file: CEN 06/2026 and 07/2026 capture a live photo with your webcam or phone camera in the form.",
  },
  {
    question: "What is the RRB NTPC signature size?",
    answer:
      "A JPG/JPEG of 30–49 KB, at least 140 × 60 pixels, scanned at 100 DPI or more, in black ink on white paper in running handwriting.",
  },
  {
    question: "Why does a 140 × 60 pixel signature get rejected as too small?",
    answer:
      "Because at that size a JPG is only a few KB, below the 30 KB minimum. 140 × 60 is the smallest allowed size, not a target; the tool enlarges it until it reaches 30 KB.",
  },
  {
    question: "Can I sign in capital letters for RRB?",
    answer: "No. Block, capital or disjointed letters, non-black ink and a thumb impression instead of a signature are all rejected.",
  },
  {
    question: "What else do SC/ST candidates upload?",
    answer: "For a free train travel pass, the SC/ST certificate as a PDF under 400 KB. The Compress PDF tool can get it there.",
  },
];

export default function RrbPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="RRB NTPC 2026 Photo and Signature Requirements"
      intro={
        <p>
          NTPC 2026 takes your photo live, so the only upload is your signature. Not affiliated with the Railway Recruitment
          Boards.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make the RRB signature</h2>
          <ol>
            <li>Sign once in joined-up handwriting with a black pen on clean white paper; scan it or photograph it from above.</li>
            <li>Choose your CEN above, add the image and crop around the ink with a small margin.</li>
            <li>
              Create the file. If it&apos;s under 30 KB, accept the offer to enlarge it, then download the 30–49 KB JPG.
            </li>
          </ol>

          <h2>Before the live photo</h2>
          <p>
            Stand against a pure white wall in plain, darker clothes. Your head should fill at least half the frame, eyes
            fully open, with no cap, mask or spectacles. You can retake until you submit.
          </p>

          <h2>Other RRB recruitments</h2>
          <p>
            Group D, ALP, JE and other notices set their own rules. Choose <strong>Other</strong> in the tool and enter the
            numbers from your CEN, or use the <Link href="/tools/signature-resizer">signature resizer</Link>.
          </p>

          <PrivacyNote>
            <p>Your signature is prepared in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="RRB NTPC Signature Size and Photo Rules at a Glance" app={app} />
        <RequirementPhotoTool tool="rrb-photo" sets={app.sets} setLabel="RRB notice (CEN)" appName="RRB" />
      </div>
    </ToolPageShell>
  );
}
