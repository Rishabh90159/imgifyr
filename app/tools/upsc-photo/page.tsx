import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("upsc-photo");
const app = APPLICATIONS.upsc;

const description =
  "UPSC photo resize for CSE, NDA and CDS forms: crop your photo and signature to the pixel and KB limits in your UPSC instructions. Free, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "UPSC Photo Size and Signature – UPSC Photo Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the UPSC photo size?",
    answer:
      "The CSE 2026 notice asks you to upload a photo and also capture a live photo in the Common Application Form. The size limits are in the portal under Instructions and FAQs > Photos and Signature.",
  },
  {
    question: "What is the NDA photo size or CDS photo size?",
    answer:
      "NDA and CDS are applied for on the same UPSC portal. Their 2026 notices ask for an uploaded photo plus a live photo in the Common Application Form, and point to the portal's Photos and Signature instructions for the limits.",
  },
  {
    question: "Why doesn't this page show the UPSC photo and signature size?",
    answer:
      "The public UPSC documents we checked disagree with each other, and the current values are inside the portal. Rather than guess, the tool lets you enter the numbers from your instructions.",
  },
  {
    question: "Can I do the UPSC photo resize online?",
    answer:
      "Yes. Choose “Other”, type the width, height and KB limits from the UPSC instructions, add your photo, crop and download.",
  },
  {
    question: "What happens if the photo is wrong?",
    answer:
      "Rule 19 of the CSE 2026 rules lists uploading an irrelevant or incorrect photo or signature among the grounds for disciplinary action.",
  },
];

export default function UpscPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="UPSC Photo Resizer"
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your UPSC photo and signature</h2>
          <ol>
            <li>Open UPSC&apos;s &ldquo;Photos and Signature&rdquo; instructions (linked above) and note the pixel and KB limits.</li>
            <li>In the tool, pick Photograph or Signature and enter those numbers exactly; leave unstated ones empty.</li>
            <li>Add the image, frame it, create the file and check the checklist before downloading.</li>
          </ol>

          <h2>Avoid these mistakes</h2>
          <ul>
            <li>Numbers from an old year or a coaching site. Use the instructions for your current application.</li>
            <li>Swapping width and height: portals write width × height, and a photo is usually taller than wide.</li>
            <li>An old photo that doesn&apos;t match the live capture you take in the form.</li>
          </ul>
          <p>
            If the instructions give only a file size, use <Link href="/tools/resize-image-to-kb">resize image to KB</Link>.
          </p>

          <PrivacyNote>
            <p>Your photo and signature are prepared in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementPhotoTool tool="upsc-photo" sets={app.sets} setLabel="Requirement" appName="UPSC" />
        <RequirementSummary heading="UPSC Photo and Signature Requirements" app={app} />
      </div>
    </ToolPageShell>
  );
}
