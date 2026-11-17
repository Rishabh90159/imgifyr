import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("kcet-photo");
const app = APPLICATIONS.kcet;

const description =
  "KCET (UGCET) asks for the student's photo and signature as JPGs, each under 50 KB. Crop both and save them under the limit here, free and in your browser.";

export const metadata: Metadata = pageMetadata({
  title: "KCET Photo Size & Signature Size – Under 50 KB, Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the KCET photo size?",
    answer: "The student's photo as a JPG under 50 KB, as KEA's application guide lists it. No pixel size is given.",
  },
  {
    question: "What is the KCET signature size?",
    answer: "The student's own signature as a JPG under 50 KB. Sign in dark ink on white paper and crop close to the signature.",
  },
  {
    question: "What else do I need to apply for KCET?",
    answer:
      "The SSLC / 10th marks card, the Aadhaar card and any certificates you claim, plus the student's own mobile number (with WhatsApp) and email ID.",
  },
  {
    question: "My name is spelled differently on my Aadhaar and marks card. What should I do?",
    answer:
      "KEA asks for the same spelling on the SSLC marks card, Aadhaar card and RD certificates. Correct the Aadhaar and certificates to match the marks card before applying.",
  },
  {
    question: "Is there a minimum file size for KCET?",
    answer:
      "KEA's guide sets only the 50 KB maximum. Still, keep the photo sharp: the tool keeps as much quality as fits under the limit instead of shrinking it further.",
  },
];

export default function KcetPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="KCET Photo Size and Signature Size"
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your KCET files</h2>
          <ol>
            <li>
              <strong>Photo:</strong> a clear, recent photo against a plain light wall, cropped to your head and shoulders.
              A busy background? Use the <Link href="/tools/white-background-photo">white background tool</Link>.
            </li>
            <li>
              <strong>Signature:</strong> sign on white paper, or draw it with the{" "}
              <Link href="/tools/signature-maker">signature maker</Link>, then crop close to the ink.
            </li>
          </ol>
          <p>The tool saves both as JPGs under 50 KB.</p>

          <PrivacyNote>
            <p>Your KCET photo and signature are processed in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementPhotoTool tool="kcet-photo" sets={app.sets} setLabel="KCET" appName="KCET" />
        <RequirementSummary heading="KCET Photo and Signature Size at a Glance" app={app} />
      </div>
    </ToolPageShell>
  );
}
