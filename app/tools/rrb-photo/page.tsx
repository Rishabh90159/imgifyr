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
  "RRB Group D, NTPC and Station Master take your photo live; only the signature is uploaded: a 30–49 KB JPG, 140 × 60 px or more, in black ink.";

export const metadata: Metadata = pageMetadata({
  title: "RRB NTPC Photo & Signature Size 2026 + Group D",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the RRB Group D and NTPC photo size?",
    answer:
      "There's no photo file: Group D, NTPC and Station Master forms capture a live photo with your webcam or phone camera. For Group D, wear dark, non-white clothes.",
  },
  {
    question: "What is the RRB Group D and NTPC signature size?",
    answer:
      "A JPG/JPEG of 30–49 KB, at least 140 × 60 pixels, scanned at 100 DPI or more, in black ink in running handwriting. The form's box is 35 mm wide for Group D and NTPC, 50 mm for Station Master.",
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
      h1="RRB NTPC, Group D and Station Master Photo and Signature Requirements"
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
            Stand against a plain wall in dark, non-white clothes, with the camera at eye level and your whole face in the
            frame. No cap, mask or spectacles. You can retake until you submit.
          </p>

          <h2>Other RRB recruitments</h2>
          <p>
            ALP, JE and other notices set their own rules: choose <strong>Other</strong> in the tool and enter the numbers
            from your CEN. Central Railway Act Apprentices have a separate{" "}
            <Link href="/tools/rrc-apprentice-photo">railway apprentice photo page</Link>.
          </p>

          <PrivacyNote>
            <p>Your signature is prepared in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementPhotoTool tool="rrb-photo" sets={app.sets} setLabel="RRB notice (CEN)" appName="RRB" />
        <RequirementSummary heading="RRB NTPC and Station Master Signature Size at a Glance" app={app} />
      </div>
    </ToolPageShell>
  );
}
