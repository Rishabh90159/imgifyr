import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { TargetSizeTool } from "@/components/tools/target-size-tool";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("20kb-photo");

const description =
  "Resize a photo or signature to 20KB or less in your browser. The tool finds the best quality that fits, shows the exact result in KB and never uploads your image.";

export const metadata: Metadata = pageMetadata({
  title: "Resize Image to 20KB Online – Free 20KB Image Compressor",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How can I resize a photo to 20KB?",
    answer:
      "Add your photo; the target is already 20 KB. Select Resize to 20 KB: the tool tries high quality first, then lower quality, and shrinks the pixel size only when quality alone can't get under the limit.",
  },
  {
    question: "Why is my photo smaller than 20KB, not exactly 20KB?",
    answer:
      "JPG quality comes in steps that change the size unevenly, so you get the best-looking file at or below 20 KB, such as 19.4 KB. Forms check a maximum, so slightly under is exactly what you want.",
  },
  {
    question: "Can every photo be reduced to 20KB?",
    answer:
      "Almost always, if the pixel size may shrink. With “Allow smaller dimensions” off, a large, detailed photo may not fit even at the lowest quality; the tool then shows the closest achievable size and explains why.",
  },
  {
    question: "What size in pixels will a 20KB photo be?",
    answer:
      "It depends on the detail. A noisy 12-megapixel test photo fitted at about 600 × 450 pixels and a 1200 × 1600 portrait at about 510 × 680. A clean signature on white paper keeps far more pixels.",
  },
  {
    question: "Is 20KB enough for a signature?",
    answer:
      "Usually yes. Signatures are mostly white space and compress very well, and several recruitment forms ask for 10–20 KB. Crop tightly and whiten the paper with the signature resizer for the cleanest result.",
  },
  {
    question: "Can I compress an image to 20KB without making it smaller in pixels?",
    answer:
      "Only if it is small or simple to begin with. Turn off Allow smaller dimensions and only the quality is lowered; a full phone photo can't keep every pixel at 20 KB.",
  },
];

export default function TwentyKbPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Image to 20KB Online"
      intro={
        <p>
          20 KB is one of the tightest upload limits, mostly for signatures and small ID photos. Add your image and the tool
          finds the sharpest 20KB photo that fits, showing the real size before you download.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to Resize an Image to 20KB</h2>
          <ol>
            <li>Crop to the face or signature first; anything else eats into the 20 KB.</li>
            <li>Add the image here. The target is already set to 20 KB.</li>
            <li>
              Keep <strong>Allow smaller dimensions</strong> on unless the form fixes the pixel size.
            </li>
            <li>Select <strong>Resize to 20 KB</strong>, zoom into the preview to check the strokes or face, then download.</li>
          </ol>

          <h2>Reduce a JPG or PNG to 20KB</h2>
          <p>
            A phone JPG is usually 2–5 MB, so 20 KB is roughly one percent of it. Rather than crush quality, the tool reduces
            the dimensions. PNGs are saved as JPG with transparent areas turned white, and a JPG already under 20 KB is handed
            back unchanged. Our deliberately noisy test images ended up at:
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">Starting image</th>
                <th scope="col">Result under 20 KB</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>12-megapixel photo (4000 × 3000)</td>
                <td>about 606 × 455 px at 78% quality</td>
              </tr>
              <tr>
                <td>Portrait photo (1200 × 1600)</td>
                <td>about 510 × 680 px at 78% quality</td>
              </tr>
              <tr>
                <td>Signature on grey paper (1400 × 700)</td>
                <td>about 800 × 400 px at 79% quality</td>
              </tr>
            </tbody>
          </table>

          <h2>When 20KB doesn&apos;t work out</h2>
          <ul>
            <li>
              <strong>&ldquo;Closest achievable size&rdquo;:</strong> turn smaller dimensions back on, or crop tighter.
            </li>
            <li>
              <strong>Rejected though under 20 KB:</strong> some sites treat 1 KB as 1,000 bytes (this tool uses 1,024), so
              try a custom 19 KB.
            </li>
            <li>
              <strong>Exact pixels needed:</strong> set them in the <Link href="/tools/image-resizer">image resizer</Link>,
              then return with smaller dimensions off.
            </li>
            <li>
              <strong>Not a hard limit?</strong> The <Link href="/tools/50kb-photo">50KB photo resizer</Link> looks better.
            </li>
          </ul>

          <h2>Signatures and exam forms</h2>
          <p>
            Current IBPS, SBI and SSC notifications ask for 10–20 KB signatures; see{" "}
            <Link href="/tools/ssc-photo">SSC photo and signature</Link>, <Link href="/tools/ibps-photo">IBPS photo</Link>{" "}
            and <Link href="/tools/sbi-photo">SBI photo</Link> for the official sources. Whiten the paper with the{" "}
            <Link href="/tools/signature-resizer">signature resizer</Link>, which can also save a PNG. For other limits,{" "}
            <Link href="/tools/resize-image-to-kb">resize image to an exact KB size</Link>.
          </p>

          <PrivacyNote>
            <p>The whole size search runs in your browser, so your signature or ID photo is never uploaded or stored.</p>
          </PrivacyNote>
        </>
      }
    >
      <TargetSizeTool
        tool="20kb-photo"
        defaultTargetKB={20}
        presetsKB={[10, 15, 20, 30, 50]}
        events={{ started: "kb_photo_started", completed: "kb_photo_completed", downloaded: "photo_downloaded" }}
      />
    </ToolPageShell>
  );
}
