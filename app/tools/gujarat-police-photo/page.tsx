import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("gujarat-police-photo");
const app = APPLICATIONS.gujaratPolice;

const description =
  "Gujarat Police (GPRB) on OJAS: photo 5 × 3.6 cm and signature 2.5 × 7.5 cm, each a JPG under 15 KB. Make both files here for the Lokrakshak form, free.";

export const metadata: Metadata = pageMetadata({
  title: "Gujarat Police Photo Size & Signature – OJAS 15 KB Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the Gujarat Police photo and signature size?",
    answer:
      "On OJAS, the photo is 5 cm high × 3.6 cm wide and the signature 2.5 cm high × 7.5 cm wide. Each must be a JPG of at most 15 KB.",
  },
  {
    question: "What is the OJAS photo size in pixels?",
    answer:
      "OJAS gives centimetres, not pixels. This tool makes the photo 213 × 295 px and the signature 443 × 148 px (150 DPI), which keeps the shape and stays sharp under 15 KB.",
  },
  {
    question: "My photo is over 15 KB. What do I do?",
    answer: "Make it here: the tool lowers the JPG quality step by step until the file is 15 KB or less, without stretching your face.",
  },
  {
    question: "Do I upload again if I have an OJAS OTR number?",
    answer: "No. A photo and signature saved with your One Time Registration are used automatically; upload again only to change them.",
  },
  {
    question: "When can I apply for Gujarat Police Lokrakshak?",
    answer:
      "Online on ojas.gujarat.gov.in from 26 November to 16 December 2026 (11:59 pm). Apply separately for each cadre you want.",
  },
];

export default function GujaratPolicePhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Gujarat Police Photo and Signature Size (OJAS)"
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your Gujarat Police photo and signature</h2>
          <ol>
            <li>Add a recent colour photo, fit the crop box around your head and shoulders, and save the 15 KB JPG.</li>
            <li>Sign on white paper with a dark pen, photograph it straight on, and switch to Signature.</li>
            <li>Upload both on OJAS, then confirm the application and print it.</li>
          </ol>

          <h2>Lokrakshak and Technical Cadre 2026-27</h2>
          <p>
            The recruitment covers 3,000 posts: unarmed, armed and SRPF constables (Lokrakshak), Head Constable Driver
            Mechanic and Motor Transport Supervisor. Forms for other boards on OJAS can use different sizes, so check the
            advertisement you apply for. Preparing for other police forms? See the{" "}
            <Link href="/tools/up-police-photo">UP Police photo and signature</Link> page.
          </p>

          <PrivacyNote>
            <p>Your photo and signature are resized in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementPhotoTool tool="gujarat-police-photo" sets={app.sets} setLabel="Gujarat Police recruitment" appName="Gujarat Police" />
        <RequirementSummary heading="Gujarat Police Photo and Signature Size at a Glance" app={app} />
      </div>
    </ToolPageShell>
  );
}
