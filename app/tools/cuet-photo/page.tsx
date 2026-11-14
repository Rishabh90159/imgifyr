import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("cuet-photo");
const app = APPLICATIONS.cuet;

const description =
  "CUET UG wants a 10–200 KB colour photo with the face filling 80% on white, and a 10–50 KB signature, both JPG. Make both files free, in your browser.";

export const metadata: Metadata = pageMetadata({
  title: "CUET Photo Size and Signature Size – CUET UG Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the CUET UG photo size?",
    answer:
      "A colour passport-size JPG/JPEG of 10–200 KB on a white background, with the face (ears showing, no mask) filling about 80% of the photo. NTA gives no pixel size.",
  },
  {
    question: "What is the CUET signature size?",
    answer: "A clearly legible JPG/JPEG between 10 KB and 50 KB. That is half NEET's and JEE's 100 KB limit, so a NEET signature file may be too big.",
  },
  {
    question: "Is this for CUET 2027?",
    answer:
      "The limits come from NTA's CUET (UG) 2026 bulletin, the latest one out. We'll update this page from the 2027 bulletin when NTA publishes it.",
  },
  {
    question: "Do I still need a photo file if CUET takes a live photo?",
    answer:
      "Yes. The form captures a live photo with your camera and also asks for the scanned passport-size photo, so prepare both.",
  },
  {
    question: "What about CUET PG?",
    answer: "We'll add CUET PG once NTA publishes its next PG bulletin on its own site, so the limits come straight from NTA.",
  },
];

export default function CuetPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="CUET Photo Size and Signature Size (UG)"
      intro={
        <p>
          Make the photo and signature for the CUET (UG) application, from NTA&apos;s latest bulletin. Not affiliated with
          the National Testing Agency.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your CUET files</h2>
          <ol>
            <li>
              <strong>Photo:</strong> stand against a white wall and crop close, so your face with both ears fills the oval
              guide. A busy background? Try the <Link href="/tools/white-background-photo">white background tool</Link>.
            </li>
            <li>
              <strong>Signature:</strong> sign on white paper, crop with a small margin and keep it legible; the tool
              saves it at 10–50 KB.
            </li>
          </ol>

          <h2>Which year these limits are from</h2>
          <p>
            The CUET (UG) 2026 bulletin; applications ran from 3 January to 4 February 2026. The 2027 bulletin is expected
            around January, and this page will follow it.
          </p>

          <PrivacyNote>
            <p>Your CUET photo and signature are processed in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="CUET Photo and Signature Size at a Glance" app={app} />
        <RequirementPhotoTool tool="cuet-photo" sets={app.sets} setLabel="CUET bulletin" appName="CUET" />
      </div>
    </ToolPageShell>
  );
}
