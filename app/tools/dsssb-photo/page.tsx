import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("dsssb-photo");
const app = APPLICATIONS.dsssb;

const description =
  "DSSSB's 2026 advertisements set the photo rules and a 15–60 KB scanned photo ID; photo and signature sizes are shown in OARS. Prepare every file here.";

export const metadata: Metadata = pageMetadata({
  title: "DSSSB Photo & Signature Size 2026 – Photo ID Scan Guide",
  description,
  path: tool.path,
});

const ID_PROOFS = [
  { doc: "PAN card", min: "300 × 200 px" },
  { doc: "Driving licence", min: "300 × 200 px" },
  { doc: "Voter ID card", min: "200 × 300 px" },
  { doc: "Passport", min: "450 × 350 px" },
];

const faqs: FaqItem[] = [
  {
    question: "What is the DSSSB photo size?",
    answer:
      "The 2026 advertisements give no file or pixel size, only rules: recent colour photo, white or off-white background, full face, eyes open. Use the size the OARS upload screen shows.",
  },
  {
    question: "What size should the scanned photo ID be for DSSSB?",
    answer:
      "A JPG/JPEG of 15–60 KB, at the minimum resolution for your document (see the table). Not needed if you give your Aadhaar number.",
  },
  {
    question: "What does DSSSB say about the signature?",
    answer: "Only that a blurred or illegible signature gets the application rejected. Sign clearly in dark ink and crop close.",
  },
  {
    question: "Why do some websites give a DSSSB photo size of 480 × 672 pixels?",
    answer: "That size isn't in DSSSB's 2026 advertisements, so we don't present it as a rule. Follow the OARS screen.",
  },
  {
    question: "Will I need a printed photo as well?",
    answer: "Possibly: bring the same photo printed on photo-quality paper whenever the Board asks.",
  },
];

export default function DsssbPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="DSSSB Photo, Signature and ID Proof Requirements"
      intro={
        <p>
          Prepare the photo, signature and scanned photo ID for a DSSSB application on OARS. Not affiliated with the Delhi
          Subordinate Services Selection Board.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Photo and signature</h2>
          <ol>
            <li>Note the size the OARS upload screen accepts, choose <strong>Other</strong> in the tool and enter it.</li>
            <li>Photo: recent, in colour, on a white or off-white wall, facing the camera with eyes open.</li>
            <li>Signature: clear, dark ink on white paper, cropped close with the clean-up on.</li>
          </ol>

          <h2>Scanned photo ID</h2>
          <p>A JPG of 15–60 KB, flat and fully readable, at no less than:</p>
          <div className="not-prose overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[20rem] text-left text-sm">
              <caption className="sr-only">Minimum resolution of the scanned photo ID for DSSSB</caption>
              <thead className="bg-surface text-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="px-3 py-2 font-medium">Document</th>
                  <th scope="col" className="px-3 py-2 font-medium">Minimum resolution</th>
                  <th scope="col" className="px-3 py-2 font-medium">File</th>
                </tr>
              </thead>
              <tbody className="text-ink-soft">
                {ID_PROOFS.map((row) => (
                  <tr key={row.doc} className="border-b border-line last:border-0">
                    <th scope="row" className="px-3 py-2 font-medium text-ink">
                      {row.doc}
                    </th>
                    <td className="px-3 py-2 tabular-nums">{row.min}</td>
                    <td className="px-3 py-2">JPG/JPEG, 15–60 KB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Crop it with the <Link href="/tools/image-cropper">image cropper</Link>, then use{" "}
            <Link href="/tools/resize-image-to-kb?target=60">resize image to KB</Link> to get under 60 KB.
          </p>

          <PrivacyNote>
            <p>The ID scan, photo and signature stay in your browser while you work on them.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="DSSSB Photo, Signature and ID Proof Size at a Glance" app={app} />
        <RequirementPhotoTool tool="dsssb-photo" sets={app.sets} setLabel="DSSSB advertisement" appName="DSSSB" />
      </div>
    </ToolPageShell>
  );
}
