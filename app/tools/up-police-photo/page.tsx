import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("up-police-photo");
const app = APPLICATIONS.upPolice;

const description =
  "UP Police constable forms take a live photo and ask for a 30–50 KB JPG signature, 140 × 60 px or 50 × 20 mm, in black pen. Make the signature file here, free.";

export const metadata: Metadata = pageMetadata({
  title: "UP Police Photo Size & Signature Size – Constable Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the UP Police photo size?",
    answer:
      "There is no photo file to upload: the form takes a live photo with your webcam or phone camera. No cap, nothing covering the face, no uniform, and no glare on glasses.",
  },
  {
    question: "What is the UP Police signature size?",
    answer: "A JPG/JPEG of 30–50 KB, sized 50 mm × 20 mm or 140 × 60 pixels, signed in black pen on white paper.",
  },
  {
    question: "Why is my 140 × 60 signature under 30 KB?",
    answer:
      "A 140 × 60 image is tiny and compresses to a few KB. The notice also allows 50 mm × 20 mm, so press \"Make it larger\": the tool keeps the shape and raises the size until it reaches 30 KB.",
  },
  {
    question: "Can I sign in capital letters?",
    answer: "No. The board asks for running (joined) letters, not block letters.",
  },
  {
    question: "Can I wear a uniform in the live photo?",
    answer:
      "No. A photo in any uniform isn't accepted, and no uniform may be worn at any stage of the recruitment, including the written exam.",
  },
];

export default function UpPolicePhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="UP Police Photo Size and Signature Size (Constable)"
      intro={
        <p>
          Make the signature file and check the live photo rules for the UP Police constable form. Not affiliated with the
          UP Police Recruitment and Promotion Board.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your UP Police signature</h2>
          <ol>
            <li>Draw a 50 mm × 20 mm box on white paper and sign inside it with a black pen, in joined letters.</li>
            <li>Photograph it straight on, add it above and fit the crop box around the signature.</li>
            <li>
              Create the file. If it comes out under 30 KB, press <strong>Make it larger</strong> to reach 30–50 KB.
            </li>
          </ol>
          <p>
            Just need an exact 140 × 60 file for another form? Use the{" "}
            <Link href="/tools/140x60-signature">140 × 60 signature resizer</Link>.
          </p>

          <h2>Before the live photo</h2>
          <p>
            Sit in even light facing the camera, without cap, mask or uniform, with your hair off your face. Tilt your glasses
            slightly if they reflect the light.
          </p>

          <PrivacyNote>
            <p>Your signature is processed in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="UP Police Signature Size and Photo Rules at a Glance" app={app} />
        <RequirementPhotoTool tool="up-police-photo" sets={app.sets} setLabel="UP Police recruitment" appName="UP Police" />
      </div>
    </ToolPageShell>
  );
}
