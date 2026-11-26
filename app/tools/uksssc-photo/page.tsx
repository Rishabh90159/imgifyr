import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("uksssc-photo");
const app = APPLICATIONS.uksssc;

const description =
  "UKSSSC photo and signature size: constable and SI forms take a live photo; the signature and left thumb impression are 150 × 100 px JPGs. Make both here, free.";

export const metadata: Metadata = pageMetadata({
  title: "UKSSSC Photo Size, Signature & Thumb Impression – 150 × 100",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the UKSSSC photo size?",
    answer:
      "There is no photo file. The constable and sub inspector forms take a live photo with your camera and check your face by face detection, so sit in good light inside the frame.",
  },
  {
    question: "What is the UKSSSC signature size?",
    answer: "A JPG/JPEG of 150 pixels wide × 100 pixels high. The advertisement gives no KB limit.",
  },
  {
    question: "What size is the UKSSSC thumb impression?",
    answer: "Also a 150 × 100 pixel JPG/JPEG, of your left thumb, used for biometric verification.",
  },
  {
    question: "Which documents do I upload?",
    answer:
      "Your High School certificate and both sides of your Aadhaar card, plus any category and hill area certificates you claim. The Aadhaar front and back tool puts both sides on one page.",
  },
  {
    question: "What are the last dates?",
    answer: "Constable: 25 December 2026. Sub Inspector: 1 to 31 December 2026. Both are on sssc.uk.gov.in.",
  },
];

export default function UkssscPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="UKSSSC Photo, Signature and Thumb Impression Size"
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your UKSSSC signature and thumb files</h2>
          <ol>
            <li>Sign on white paper with a dark pen, and put a clear left thumb impression on another sheet.</li>
            <li>Photograph each straight on and add it above; choose Signature or Left thumb impression.</li>
            <li>Fit the crop box and save the 150 × 100 JPG.</li>
          </ol>

          <h2>Uttarakhand police constable and SI 2026</h2>
          <p>
            The constable advertisement covers 1,694 posts, including police, PAC/IRB, fireman, forest guard and jail
            warder; the sub inspector one covers 200. Join your Aadhaar sides with{" "}
            <Link href="/tools/aadhaar-front-and-back">Aadhaar front and back</Link>, or see the{" "}
            <Link href="/tools/up-police-photo">UP Police</Link> page for a neighbouring state&apos;s form.
          </p>

          <PrivacyNote>
            <p>Your signature and thumb impression are processed in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementPhotoTool tool="uksssc-photo" sets={app.sets} setLabel="UKSSSC recruitment" appName="UKSSSC" />
        <RequirementSummary heading="UKSSSC Signature and Thumb Impression Size at a Glance" app={app} />
      </div>
    </ToolPageShell>
  );
}
