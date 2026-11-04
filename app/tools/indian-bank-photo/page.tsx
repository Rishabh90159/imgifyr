import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("indian-bank-photo");
const app = APPLICATIONS.indianBank;

const description =
  "Indian Bank Apprentice 2026-27 needs a 20–50 KB photo, a 10–20 KB signature, a thumb impression and a hand-written declaration. Make all four here.";

export const metadata: Metadata = pageMetadata({
  title: "Indian Bank Apprentice Photo & Signature Size 2026",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the Indian Bank Apprentice photo size?",
    answer:
      "Upload a JPG of 20 to 50 KB, ideally 200 by 230 pixels. The form also takes a live photo through your webcam or a QR code on your phone.",
  },
  {
    question: "What is the Indian Bank signature size?",
    answer: "Ideally 140 by 60 pixels and 10 to 20 KB. Use black ink; the bank rejects a signature written in capitals.",
  },
  {
    question: "What size is the thumb impression and the declaration?",
    answer:
      "Left thumb: 240 × 240 pixels at 200 DPI (3 × 3 cm), 20–50 KB. Declaration: 800 × 400 pixels at 200 DPI (10 × 5 cm), 50–100 KB, written in English.",
  },
  {
    question: "Can I reuse my IBPS or SBI files for Indian Bank?",
    answer:
      "The pixel and KB limits are the same as IBPS, so files made to those limits fit. The declaration must be the Indian Bank text shown in the full rules above.",
  },
  {
    question: "Do I need a NATS account first?",
    answer: "Yes. Register and complete your profile on the NATS 2.0 portal before applying on Indian Bank's site.",
  },
];

export default function IndianBankPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Indian Bank Apprentice 2026 Photo, Signature and Declaration Size"
      intro={
        <p>
          Make the four images the Indian Bank Apprentice FY 2026-27 form asks for. Not affiliated with Indian Bank.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your Indian Bank files</h2>
          <ol>
            <li>
              <strong>Photograph</strong> and <strong>signature:</strong> choose each above and crop; the tool saves the
              preferred pixel size inside the KB range.
            </li>
            <li>
              <strong>Left thumb impression:</strong> black or blue ink on white paper.
            </li>
            <li>
              <strong>Declaration:</strong> copy the text in English, in your own handwriting and not in capitals.
            </li>
          </ol>
          <p>
            The sizes match IBPS, so the <Link href="/tools/ibps-photo">IBPS files</Link> follow the same rules.
          </p>

          <h2>Application dates</h2>
          <p>Apply and pay the fee from 5 to 25 November 2026 for the 1,500 apprentice seats.</p>

          <PrivacyNote>
            <p>All four files are made in your browser; none is uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="Indian Bank Apprentice Photo and Signature Size at a Glance" app={app} />
        <RequirementPhotoTool tool="indian-bank-photo" sets={app.sets} setLabel="Indian Bank advertisement" appName="Indian Bank" />
      </div>
    </ToolPageShell>
  );
}
