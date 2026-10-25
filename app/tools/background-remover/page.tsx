import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundRemoverTool } from "@/components/tools/background-remover-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("background-remover");

const description =
  "Free background remover that runs in your browser. Remove the background from an image automatically, then download a transparent PNG or a white background.";

export const metadata: Metadata = pageMetadata({
  title: "Free Background Remover – Remove Image Background Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How does the background remover work?",
    answer:
      "A small neural network, U²-Netp, estimates which pixels belong to the main subject. The mask is then refined against the edges of your full-size photo and everything else is made transparent, all in your browser.",
  },
  {
    question: "Is my photo uploaded to remove the background?",
    answer:
      "No. The model and its runtime are downloaded from this site the first time you use the tool; after that your browser does the work and the photo never leaves your device.",
  },
  {
    question: "Why does the first image take longer?",
    answer:
      "Your browser first downloads and prepares the model and runtime (up to about 19 MB). They're cached afterwards, so later images take a few seconds, depending on your device.",
  },
  {
    question: "How do I get a white background instead of a transparent one?",
    answer:
      "Choose White (or Colour for any other shade) under New background, then save as JPG, which many upload forms prefer, or as PNG.",
  },
  {
    question: "Can I use it for a passport or visa photo?",
    answer:
      "Check the rules first. Many authorities want a photo taken against a plain background, and some, such as the UK, require digital photos to be unaltered by software, so a replaced background may be rejected.",
  },
  {
    question: "Why are some edges rough or cut off?",
    answer:
      "The model is small enough to run on phones, so it's less precise than large server-based tools. Try the other edge setting, a photo with more contrast, or crop closer to the subject first.",
  },
];

export default function BackgroundRemoverPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Remove Background from Image Online"
      intro={
        <p>
          This free background remover cuts out a person, pet or product as a transparent PNG or on a white or coloured
          background. It runs in your browser, so your photo is never uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to Remove Background from an Image</h2>
          <ol>
            <li>Choose, drop or paste a photo; the background is removed straight away.</li>
            <li>Drag the divider to compare the original and the cut-out.</li>
            <li>Keep it transparent, or pick white or another colour, then download.</li>
          </ol>

          <h2>Online Background Remover, No Watermark</h2>
          <p>
            No account, credits or watermark, and the result keeps your photo&apos;s full resolution. The model is U²-Netp, a
            compact version of the U²-Net salient-object model (<a href="/models/u2netp-LICENSE.txt">Apache 2.0 licence</a>),
            run with ONNX Runtime&apos;s WebAssembly engine. A guided filter fits its rough mask to the edges of your full-size
            photo.
          </p>

          <h2>Getting a clean cut-out</h2>
          <ul>
            <li>Use a photo where the subject is in focus and contrasts with the background.</li>
            <li>
              Crop away other people and clutter first with the <Link href="/tools/image-cropper">image cropper</Link>.
            </li>
            <li>&ldquo;Soft&rdquo; edges suit hair and fur; &ldquo;Crisp&rdquo; suits products with hard outlines.</li>
            <li>Fine hair, glass, smoke and shadows are hard for any automatic tool.</li>
          </ul>

          <h2>Formats and file size</h2>
          <p>
            Input: JPG, PNG, WebP and HEIC. Transparent results are PNG; with a coloured background you can also choose JPG.
            Shrink large PNGs with the <Link href="/tools/image-resizer">image resizer</Link> or{" "}
            <Link href="/tools/image-compressor">image compressor</Link>, or convert with{" "}
            <Link href="/tools/png-to-jpg">PNG to JPG</Link>.
          </p>

          <PrivacyNote>
            <p>The model and runtime come from this site, and your photo is processed on your device and never sent anywhere.</p>
          </PrivacyNote>
        </>
      }
    >
      <BackgroundRemoverTool />
    </ToolPageShell>
  );
}
