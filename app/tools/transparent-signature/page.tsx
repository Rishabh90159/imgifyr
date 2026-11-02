import type { Metadata } from "next";
import Link from "next/link";
import { SignatureResizerTool } from "@/components/tools/signature-resizer-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("transparent-signature");

const description =
  "Make a transparent signature online: remove the paper from a photo of your signature, keep the ink or make it black or blue, and download a PNG. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "Transparent Signature Maker – Signature PNG Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Why is the signature saved as PNG and not JPG?",
    answer:
      "Only PNG can store see-through pixels. A JPG always fills the background with a colour, so the paper would come back as a white box behind your name.",
  },
  {
    question: "Can I make my signature blue or black?",
    answer:
      "Yes. Under Ink colour, choose Black or Blue and every stroke becomes that one solid colour, with smooth edges. As written keeps your pen's own colour.",
  },
  {
    question: "Does it work with lined or coloured paper?",
    answer:
      "Plain white paper gives the cleanest result. Faint lines and light tints usually vanish; if dark lines remain, move the clean-up slider right or crop them out.",
  },
  {
    question: "How do I add the signature to a Word file or PDF?",
    answer:
      "In Word or Google Docs, insert it as a picture and set it in front of text. In a PDF editor, use its add image option. The transparent background sits cleanly on the page.",
  },
  {
    question: "Can I use it for an exam or job application?",
    answer:
      "Most application forms ask for a JPG on white within a KB limit. For those, use the signature resizer, which sets the pixel size and file size.",
  },
  {
    question: "Is my signature uploaded?",
    answer: "No. The background is removed by your browser, on your device, and the signature is never sent anywhere.",
  },
];

export default function TransparentSignaturePage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Transparent Signature Maker"
      intro={
        <p>
          Sign on paper, take a photo, and get a PNG of only the ink on a see-through background. Place it on letters, PDFs
          and documents without a white box around it.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to make a transparent signature</h2>
          <ol>
            <li>Sign on plain white paper with a dark pen and photograph it in even light.</li>
            <li>Drop the photo here and drag the box tightly around your signature.</li>
            <li>Adjust the clean-up strength until the paper is gone and the strokes are whole.</li>
            <li>Pick the ink colour, select <strong>Create signature image</strong> and download the PNG.</li>
          </ol>

          <h2>Tips for clean edges</h2>
          <p>
            Shadows and uneven light are the usual problem. The clean-up measures the paper around every stroke, so a soft
            shadow across the page is removed too. A thicker pen gives fuller strokes; if thin parts fade, move the slider
            left. Solid black or blue also hides patchy ink.
          </p>

          <h2>Signature for documents or for forms?</h2>
          <p>
            A transparent PNG suits documents you sign digitally. Online application forms usually want a white-background JPG
            of a set size instead: prepare that with the <Link href="/tools/signature-resizer">signature resizer</Link>, or
            put it next to your photo with the <Link href="/tools/merge-photo-and-signature">photo and signature joiner</Link>.
          </p>

          <PrivacyNote>
            <p>Your signature is processed on your device and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <SignatureResizerTool tool="transparent-signature" initialBackground="transparent" />
    </ToolPageShell>
  );
}
