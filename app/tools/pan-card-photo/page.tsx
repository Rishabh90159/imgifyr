import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("pan-card-photo");
const app = APPLICATIONS.pan;

const description =
  "PAN card photo size: 3.5 × 2.5 cm, under 20 KB; signature 2 × 4.5 cm, under 10 KB; both colour JPEGs at 200 DPI (NSDL/Protean). Resize both here, free.";

export const metadata: Metadata = pageMetadata({
  title: "PAN Card Photo Size & Signature Size in KB – Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the PAN card photo size in KB and cm?",
    answer:
      "Protean (NSDL) asks for a colour JPEG scanned at 200 DPI, 3.5 cm high and 2.5 cm wide, up to 20 KB. That works out to 197 × 276 pixels.",
  },
  {
    question: "What is the PAN card signature size?",
    answer:
      "A colour JPEG at 200 DPI, 2 cm high and 4.5 cm wide, up to 10 KB, which is 354 × 157 pixels: a wide strip, so keep the autograph on one line.",
  },
  {
    question: "Is the NSDL PAN photo size the same for correction?",
    answer:
      "Yes. Protean lists the same photo and signature specification for a new PAN (Form 49A) and for changes or correction in PAN data.",
  },
  {
    question: "What about the supporting documents?",
    answer: "Proof of identity, address and date of birth: black and white, 200 DPI, PDF/A or JPEG, up to 300 KB per page.",
  },
  {
    question: "My PAN photo is over 20 KB. How do I reduce it?",
    answer:
      "Crop it here: the tool saves 197 × 276 pixels and lowers the JPEG quality only as far as needed to fit under 20 KB, so the face stays clear.",
  },
];

export default function PanCardPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="PAN Card Photo Size and Signature Size"
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>PAN card photo resize: make both files</h2>
          <ol>
            <li>
              Choose <strong>Photograph</strong>, add a recent colour picture where you look straight ahead, and fit your
              face inside the portrait box. Messy wall behind you? Clean it up with the{" "}
              <Link href="/tools/white-background-photo">white background tool</Link>.
            </li>
            <li>
              Switch to <strong>Signature</strong> and add a photo of your autograph in dark ink, or create one with the{" "}
              <Link href="/tools/signature-maker">signature maker</Link>. Leave only a thin margin around it.
            </li>
          </ol>
          <p>Downloads come out at 200 DPI: the photo below 20 KB, the signature below 10 KB, ready for the Protean form.</p>

          <PrivacyNote>
            <p>Your PAN photo and signature are processed in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementPhotoTool tool="pan-card-photo" sets={app.sets} setLabel="PAN application" appName="PAN" />
        <RequirementSummary heading="PAN Card Photo and Signature Size at a Glance" app={app} />
      </div>
    </ToolPageShell>
  );
}
