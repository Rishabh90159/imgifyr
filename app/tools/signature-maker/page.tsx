import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { SignatureMakerTool } from "@/components/tools/signature-maker-tool";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("signature-maker");

const description =
  "Free online signature maker: draw your signature with a finger or mouse, or type your name in a handwriting style, then download a transparent PNG or a JPG.";

export const metadata: Metadata = pageMetadata({
  title: "Online Signature Maker – Draw or Type a Signature Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Is this a legal digital signature?",
    answer:
      "No. It makes an image of your signature for documents and forms. A legally valid digital signature (a DSC or Aadhaar eSign) is issued by a certifying authority.",
  },
  {
    question: "Can I use a typed signature on an exam form?",
    answer:
      "It's not recommended. Most exam and government notices ask for your own handwritten signature. Draw it here, or sign on paper and use the signature resizer.",
  },
  {
    question: "How do I fit my signature to a form's size and KB limit?",
    answer:
      "Create it, then tap Resize for an exam form. The signature opens in the signature resizer, which sets the pixel size and KB limit, such as 140 × 60 px or 10–20 KB.",
  },
  {
    question: "Should I download PNG or JPG?",
    answer: "PNG keeps a see-through background, best for Word, PDFs and letters. JPG puts the signature on white, which most online forms ask for.",
  },
  {
    question: "How do I draw a neat signature on my phone?",
    answer: "Turn the phone sideways for a wider pad, sign at your normal speed, and use Undo for a bad stroke. A stylus gives the smoothest line.",
  },
  {
    question: "Is my signature uploaded?",
    answer: "No. It is drawn and saved by your browser, on your device, and never sent anywhere.",
  },
];

export default function SignatureMakerPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Online Signature Maker"
      intro={<p>Draw your signature or type it in a handwriting style, then save it as a PNG or JPG.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Draw or type your signature</h2>
          <ol>
            <li>
              <strong>Draw:</strong> sign on the pad with your finger, a stylus or the mouse. Pick a pen and black or blue
              ink.
            </li>
            <li>
              <strong>Type:</strong> enter your name and choose one of four handwriting styles, for letters, emails and
              documents.
            </li>
            <li>Create the signature: it&apos;s trimmed to the ink and ready as a transparent PNG or a JPG on white.</li>
          </ol>

          <h2>Signatures for exam and job forms</h2>
          <p>
            Forms set a size and KB limit, and most want your real handwritten signature. Draw it here or sign on paper,
            then use the <Link href="/tools/signature-resizer">signature resizer</Link> or a preset such as the{" "}
            <Link href="/tools/20kb-signature">20 KB signature</Link> page. For a see-through PNG from a photo of your
            signature, use the <Link href="/tools/transparent-signature">transparent signature</Link> tool.
          </p>

          <PrivacyNote>
            <p>Your signature is drawn and saved in your browser and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <SignatureMakerTool />
    </ToolPageShell>
  );
}
