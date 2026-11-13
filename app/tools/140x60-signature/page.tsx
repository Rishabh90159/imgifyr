import type { Metadata } from "next";
import Link from "next/link";
import { SignatureResizerTool } from "@/components/tools/signature-resizer-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("140x60-signature");

const description =
  "Resize your signature to 140 × 60 pixels under 20 KB, the size bank and many exam forms ask for. Grey paper is cleaned to white. Free, nothing uploaded.";

export const metadata: Metadata = pageMetadata({
  title: "Signature 140x60 Pixels Resizer – Under 20 KB",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Which forms ask for a 140 × 60 signature?",
    answer:
      "IBPS, SBI and Indian Bank list 140 × 60 pixels as the preferred size, 10–20 KB. RRB asks for at least 140 × 60 and 30–49 KB.",
  },
  {
    question: "How do I resize my signature to 140 × 60?",
    answer:
      "Add a photo of your signature, crop around the ink and create the file. The crop is locked to the 140:60 shape, so the signature isn't stretched.",
  },
  {
    question: "Why does my signature look thin at 140 × 60?",
    answer:
      "Too much empty paper was kept, so the ink became tiny. Crop closer, and sign with a darker pen, so the strokes stay visible.",
  },
  {
    question: "My form wants 10–20 KB but the file is smaller. What do I do?",
    answer:
      "A 140 × 60 signature on white often compresses below 10 KB. Use resize image to KB with a 10 KB minimum, or a slightly larger size if the form allows.",
  },
  {
    question: "Is my signature uploaded?",
    answer: "No. It's cleaned and resized in your browser and stays on your device.",
  },
];

export default function Signature140x60Page() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Signature to 140 × 60 Pixels"
      intro={
        <p>
          Get a crisp 140 × 60 pixel signature under 20 KB, with grey paper turned clean white. The shape is locked so your
          signature is never squeezed.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make a 140 × 60 signature</h2>
          <ol>
            <li>Sign in black ink on white paper, in your usual running hand, not capitals.</li>
            <li>Photograph it from above, add it here and crop close to the ink.</li>
            <li>Create the file and check it shows 140 × 60 px under 20 KB.</li>
          </ol>

          <h2>Exam rules for this size</h2>
          <p>
            Bank forms pair it with a <Link href="/tools/200x230-photo">200 × 230 photo</Link>; the official wording is on
            the <Link href="/tools/ibps-photo">IBPS</Link> and <Link href="/tools/sbi-photo">SBI</Link> pages. RRB&apos;s
            larger 30–49 KB signature has its own <Link href="/tools/rrb-photo">RRB page</Link>. For any other size, use the{" "}
            <Link href="/tools/signature-resizer">signature resizer</Link>.
          </p>

          <PrivacyNote>
            <p>Your signature is processed in your browser and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <SignatureResizerTool tool="140x60-signature" defaults={{ width: "140", height: "60", maxKB: "20" }} />
    </ToolPageShell>
  );
}
