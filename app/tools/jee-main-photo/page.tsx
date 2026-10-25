import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("jee-main-photo");
const app = APPLICATIONS.jee;

const description =
  "JEE Main 2027 asks for a 10–200 KB JPG photo (white background, 80% face, ears visible) and a 10–100 KB JPG signature. Make both here, free, from NTA's bulletin.";

export const metadata: Metadata = pageMetadata({
  title: "JEE Main Photo & Signature Size 2027 – KB Converter",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the JEE Main photo size?",
    answer:
      "Between 10 KB and 200 KB, saved as JPG/JPEG. NTA wants a recent colour passport-size picture, white backdrop, and the face (ears visible, no mask) taking up 80% of it.",
  },
  {
    question: "What is the JEE Main signature size?",
    answer: "A JPG/JPEG of 10–100 KB, clearly legible. Figures like 4–30 KB on other sites aren't from the 2027 bulletin.",
  },
  {
    question: "What is the JEE Main photo size in pixels or cm?",
    answer:
      "NTA doesn't give one, only the format and file size. So the tool keeps your crop and only shrinks it if needed to stay under the limit.",
  },
  {
    question: "Do I still upload a photo if JEE Main takes a live photo?",
    answer:
      "Yes, both. You capture a live photo in the form (webcam, or a phone via the QR code) and also upload the scanned passport-size photo.",
  },
  {
    question: "Can I change my photo or signature after submitting?",
    answer:
      "Only in the correction window, 27–29 November 2026 for Session 1. The same application number carries into Session 2, so check both files before paying.",
  },
];

export default function JeeMainPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="JEE Main 2027 Photo and Signature Size"
      intro={
        <p>Make your JEE (Main) 2027 photo and signature within NTA&apos;s limits. Not affiliated with the National Testing Agency.</p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your JEE Main files</h2>
          <ol>
            <li>Stand in front of a plain white background in daylight, mask off and both ears uncovered, and take the photo.</li>
            <li>
              Load it as the <strong>Photograph</strong>, crop in until your face takes up roughly four-fifths of the picture, then make the photo file.
            </li>
            <li>Sign on blank paper, load it as the <strong>Signature</strong>, trim the margins and make the second file.</li>
          </ol>

          <h2>Key dates</h2>
          <ul>
            <li>
              <strong>Session 1:</strong> apply by 22 November 2026 (late fee until 26 November); exams 20–24 and 28 January 2027.
            </li>
            <li>
              <strong>Session 2:</strong> apply 5 January – 3 February 2027; exams 2–7 April 2027.
            </li>
          </ul>

          <h2>Avoid these mistakes</h2>
          <ul>
            <li>A half-body photo, a mask, hidden ears or a coloured background.</li>
            <li>Filters or face edits: morphed photos count as unfair means.</li>
            <li>
              A Class 10 marksheet PDF over 300 KB. Shrink it with the <Link href="/tools/compress-pdf">PDF compressor</Link>.
            </li>
          </ul>

          <PrivacyNote>
            <p>Both JEE files are made inside your browser; this site never receives them.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="JEE Main Photo Size in KB and Signature Size at a Glance" app={app} />
        <RequirementPhotoTool tool="jee-main-photo" sets={app.sets} setLabel="Information bulletin" appName="JEE Main" />
      </div>
    </ToolPageShell>
  );
}
