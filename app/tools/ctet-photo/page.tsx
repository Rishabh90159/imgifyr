import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("ctet-photo");
const app = APPLICATIONS.ctet;

const description =
  "CTET asks for a 3.5 × 4.5 cm photo of 10–100 KB and a 3.5 × 1.5 cm signature of 3–30 KB, both JPG. Crop to that shape and hit the KB range here, free.";

export const metadata: Metadata = pageMetadata({
  title: "CTET Photo Size and Signature Size – Free CTET Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the CTET photo size?",
    answer: "3.5 cm wide by 4.5 cm high, as a JPG/JPEG between 10 KB and 100 KB. The bulletin gives the size in cm, not pixels.",
  },
  {
    question: "What is the CTET signature size?",
    answer: "3.5 cm long by 1.5 cm high, as a JPG/JPEG between 3 KB and 30 KB.",
  },
  {
    question: "How do I get a 3.5 × 4.5 cm photo in pixels?",
    answer:
      "You don't need a pixel count: what matters is the 7:9 shape and the KB range. The crop box here is locked to that shape. To set an exact print size, use resize image in cm.",
  },
  {
    question: "Is this for the next CTET session?",
    answer:
      "The limits come from CBSE's CTET September 2026 bulletin, the latest one out. We'll update this page from the next bulletin when CBSE publishes it.",
  },
  {
    question: "Are the photo and signature compulsory?",
    answer: "Yes. The bulletin says uploading both is mandatory, in JPG/JPEG format.",
  },
];

export default function CtetPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="CTET Photo Size and Signature Size"
      intro={
        <p>
          Make the photo and signature for the CTET application, from CBSE&apos;s latest bulletin. Not affiliated with CBSE
          or the CTET unit.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your CTET files</h2>
          <ol>
            <li>
              <strong>Photo:</strong> a recent photo, cropped in the locked 3.5 × 4.5 cm box with your head and shoulders.
            </li>
            <li>
              <strong>Signature:</strong> sign on white paper and fit the 3.5 × 1.5 cm box around it; the tool keeps it
              under 30 KB.
            </li>
          </ol>
          <p>
            Need the exact print size as well? <Link href="/tools/resize-image-in-cm">Resize the image in cm</Link>.
          </p>

          <h2>Which session these limits are from</h2>
          <p>
            The CTET September 2026 bulletin; applications ran from 11 May to 10 June 2026. The page will follow the next
            bulletin when CBSE publishes it.
          </p>

          <PrivacyNote>
            <p>Your CTET photo and signature are processed in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="CTET Photo and Signature Size at a Glance" app={app} />
        <RequirementPhotoTool tool="ctet-photo" sets={app.sets} setLabel="CTET bulletin" appName="CTET" />
      </div>
    </ToolPageShell>
  );
}
