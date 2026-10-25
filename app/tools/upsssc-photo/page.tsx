import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("upsssc-photo");
const app = APPLICATIONS.upsssc;

const description =
  "UPSSSC One Time Registration asks for a 50–100 KB photo and a 30–50 KB signature with your name in Hindi below it. Make both JPGs here, free.";

export const metadata: Metadata = pageMetadata({
  title: "UPSSSC Photo & Signature Size – OTR Photo Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the UPSSSC photo size?",
    answer: "A recent colour photo (within 6 months) as a JPEG/JPG of 50–100 KB. The OTR notice gives no pixel size.",
  },
  {
    question: "What is the UPSSSC signature size?",
    answer:
      "A JPEG/JPG of 30–50 KB. Sign in Hindi or English and write your name in Hindi below it; English capital letters are invalid.",
  },
  {
    question: "Do I upload a new photo for the Inter Level or other mains?",
    answer:
      "No. For Inter Level (26-Exam/2026) the PET-2025 photo and signature are reused and can't be changed. New uploads go in the OTR.",
  },
  {
    question: "Can I change my OTR photo later?",
    answer:
      "The 31 July 2026 notice allows changes through “Modify OTR Form Details”, except the mobile number (and name and date of birth if you registered with a PET-2025 number).",
  },
  {
    question: "Is UPSSSC the same as UPESSC?",
    answer:
      "No. UPESSC recruits teachers (such as UP TGT) through its own OTR with different limits; see the UPESSC page.",
  },
];

export default function UpssscPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="UPSSSC OTR Photo and Signature Size"
      intro={
        <p>
          Every UPSSSC exam uses the photo and signature from your One Time Registration. Not affiliated with the Uttar Pradesh
          Subordinate Services Selection Commission.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your UPSSSC files</h2>
          <ol>
            <li>
              Pick <strong>Photograph</strong>, add a colour photo from the last six months, crop head to shoulders and create a
              50–100 KB file.
            </li>
            <li>
              Under your signature, write your name in Hindi by hand, in dark ink on white paper. Photograph both lines
              together.
            </li>
            <li>
              Pick <strong>Signature</strong>, crop around both lines, keep the clean-up on and create a 30–50 KB file.
            </li>
          </ol>

          <h2>Avoid these mistakes</h2>
          <ul>
            <li>Leaving out the Hindi name, or signing in English capital letters.</li>
            <li>
              A file under the minimum. Use the <Link href="/tools/image-size-increase">image size increaser</Link> rather than
              adding blur or borders.
            </li>
            <li>
              Confusing UPSSSC with UPESSC. For UP TGT and other teaching posts, use the{" "}
              <Link href="/tools/upessc-photo">UPESSC photo page</Link>.
            </li>
          </ul>

          <PrivacyNote>
            <p>Nothing you add for your OTR leaves this device.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="UPSSSC Photo Size in KB and Signature Size at a Glance" app={app} />
        <RequirementPhotoTool tool="upsssc-photo" sets={app.sets} setLabel="UPSSSC registration" appName="UPSSSC" />
      </div>
    </ToolPageShell>
  );
}
