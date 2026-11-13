import type { Metadata } from "next";
import Link from "next/link";
import { SignatureResizerTool } from "@/components/tools/signature-resizer-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("30kb-signature");

const description =
  "Make a signature JPG of up to 30 KB with a clean white background, for forms that allow a larger, sharper signature. Free and private: nothing is uploaded.";

export const metadata: Metadata = pageMetadata({
  title: "30 KB Signature Resizer – Signature Under 30 KB",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I make my signature under 30 KB?",
    answer:
      "Add a photo of your signature, crop around it and create the file. The paper is whitened and the JPG is kept at or below 30 KB.",
  },
  {
    question: "My form says 30–49 KB. Is this the right page?",
    answer:
      "No, that's a minimum of 30 KB, as on RRB forms. Use the RRB page, which enlarges the signature until it reaches 30 KB.",
  },
  {
    question: "Why allow 30 KB instead of 20?",
    answer: "More bytes keep thin strokes sharp at larger pixel sizes, so a 30 KB limit gives a clearer signature.",
  },
  {
    question: "Can I set exact pixels as well?",
    answer: "Yes. Enter the width and height your form gives; the crop follows that shape so nothing is stretched.",
  },
  {
    question: "Is my signature uploaded?",
    answer: "No. It's processed in your browser on your own device.",
  },
];

export default function Signature30kbPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Signature Under 30 KB"
      intro={
        <p>
          When a form allows up to 30 KB, use the extra room for a sharper signature. This page whitens the paper and keeps
          the JPG at or below 30 KB.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How it works</h2>
          <ol>
            <li>Photograph a signature in dark ink on white paper.</li>
            <li>Add it and crop with a small margin around the ink.</li>
            <li>Create the file and download the JPG of 30 KB or less.</li>
          </ol>

          <h2>Maximum or minimum?</h2>
          <p>
            &ldquo;Up to 30 KB&rdquo; is a ceiling, which this page handles. &ldquo;30–49 KB&rdquo; on the{" "}
            <Link href="/tools/rrb-photo">RRB signature</Link> is a floor as well. Smaller limits: the{" "}
            <Link href="/tools/20kb-signature">20 KB signature</Link> or{" "}
            <Link href="/tools/10kb-photo">10 KB</Link> pages.
          </p>

          <PrivacyNote>
            <p>Your signature is never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <SignatureResizerTool tool="30kb-signature" defaults={{ maxKB: "30" }} />
    </ToolPageShell>
  );
}
