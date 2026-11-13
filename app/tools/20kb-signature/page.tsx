import type { Metadata } from "next";
import Link from "next/link";
import { SignatureResizerTool } from "@/components/tools/signature-resizer-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("20kb-signature");

const description =
  "Resize a signature to 20 KB or less for SSC, bank and state exam forms. The paper is whitened and the ink kept sharp. Works on phone, nothing is uploaded.";

export const metadata: Metadata = pageMetadata({
  title: "Signature Resize to 20 KB – 10 to 20 KB Signature Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Which exams need a 10–20 KB signature?",
    answer: "SSC CGL and CHSL, and the IBPS, SBI and Indian Bank forms, ask for a 10–20 KB signature in JPG.",
  },
  {
    question: "How do I reduce my signature to 20 KB?",
    answer:
      "Add a photo of the signature, crop close to the ink and create the file. The tool whitens the paper and lowers the size until it's under 20 KB.",
  },
  {
    question: "My signature came out under 10 KB. Is that a problem?",
    answer:
      "Yes, if the form says 10–20 KB. Keep a little more margin or use resize image to KB with a 10 KB minimum.",
  },
  {
    question: "Can I sign in capital letters?",
    answer: "No. SSC and the banks reject signatures written in capitals; sign the way you usually do.",
  },
  {
    question: "Is my signature uploaded?",
    answer: "No. The whole process runs in your browser.",
  },
];

export default function Signature20kbPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Signature to 20 KB"
      intro={
        <p>
          The 10–20 KB signature is the most common exam requirement. Add a photo of your signature and get a clean, white
          background JPG under 20 KB.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Signature under 20 KB in three steps</h2>
          <ol>
            <li>Sign on plain white paper with a black pen and photograph it in daylight.</li>
            <li>Add it here and crop tightly around the signature.</li>
            <li>Create the file; the size is shown before you download.</li>
          </ol>

          <h2>Exam-specific sizes</h2>
          <p>
            SSC now captures the photo live, so the signature is the only upload: see the{" "}
            <Link href="/tools/ssc-photo">SSC page</Link>. Bank forms also fix the pixels, which the{" "}
            <Link href="/tools/140x60-signature">140 × 60 signature</Link> page handles. Need up to 30 KB? Try the{" "}
            <Link href="/tools/30kb-signature">30 KB signature</Link>.
          </p>

          <PrivacyNote>
            <p>Your signature stays on your device; nothing is uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <SignatureResizerTool tool="20kb-signature" defaults={{ maxKB: "20" }} />
    </ToolPageShell>
  );
}
