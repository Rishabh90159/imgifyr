import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("mht-cet-photo");
const app = APPLICATIONS.mhtCet;

const description =
  "MHT CET asks for a square 2 × 2 inch colour photo, face covering 80%, on a light background, between 100 KB and 5 MB. Crop and size yours here, free.";

export const metadata: Metadata = pageMetadata({
  title: "MHT CET Photo Size – 2×2 Inch, 100 KB to 5 MB Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the MHT CET photo size in KB and inches?",
    answer:
      "A square 2 × 2 inch (50 × 50 mm) colour photo with your face covering 80% of it, as a file between 100 KB and 5 MB. The brochure gives no pixel size.",
  },
  {
    question: "Do I need to upload a signature for MHT CET?",
    answer: "The State CET Cell brochure asks only for a photograph; it lists no signature upload.",
  },
  {
    question: "Why does my MHT CET photo need to be at least 100 KB?",
    answer:
      "The CET Cell wants a high-resolution, clear picture. A small crop can fall under 100 KB; the tool then offers to make it larger with the same square shape.",
  },
  {
    question: "What are the MHT CET photo requirements for the background?",
    answer: "Plain white or light-coloured, evenly lit, with no shadows on your face or behind you.",
  },
  {
    question: "Can I wear glasses in the MHT CET photo?",
    answer: "Clear glasses only, with no glare: tilt your head slightly. Tinted or dark glasses aren't allowed.",
  },
];

export default function MhtCetPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="MHT CET Photo Size and Requirements"
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>MHT CET photo resize: make your photo</h2>
          <ol>
            <li>Sit facing even light against a plain white or light wall, looking straight at the camera.</li>
            <li>
              Crop in the square box so your face fills the oval, with your whole head from hair to chin. A busy wall? Use
              the <Link href="/tools/white-background-photo">white background tool</Link> first.
            </li>
            <li>Create the file: the tool saves a square JPG between 100 KB and 5 MB.</li>
          </ol>

          <PrivacyNote>
            <p>Your MHT CET photo is processed in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementPhotoTool tool="mht-cet-photo" sets={app.sets} setLabel="MHT CET" appName="MHT CET" />
        <RequirementSummary heading="MHT CET Photo Size at a Glance" app={app} />
      </div>
    </ToolPageShell>
  );
}
