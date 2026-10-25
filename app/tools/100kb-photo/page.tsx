import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { TargetSizeTool } from "@/components/tools/target-size-tool";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("100kb-photo");

const description =
  "Reduce a photo to 100KB online while keeping it sharp. See the before and after size, dimensions and quality, then download. Runs in your browser, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Resize Image to 100KB Online – Free 100KB Image Compressor",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I resize an image to 100KB?",
    answer:
      "Add the photo and select Resize to 100 KB, which is preset. It is tried at full size and high quality first, then at lower quality, and the dimensions are reduced only if needed.",
  },
  {
    question: "Why isn't the result exactly 100KB?",
    answer:
      "Encoders work in quality steps whose effect on size depends on the picture, so you get the best result at or below 100 KB, for example 97.8 KB. Sizes are never rounded down: 100.0 KB means at most 102,400 bytes.",
  },
  {
    question: "Will my photo keep its full resolution at 100KB?",
    answer:
      "Smaller photos usually do. A detailed 4000 × 3000 test photo fitted at about 1245 × 933 pixels, still plenty for screens and most forms. Turn off “Allow smaller dimensions” to keep the original size; quality drops instead.",
  },
  {
    question: "How do I reduce photo size without losing too much quality?",
    answer:
      "Let the dimensions shrink rather than forcing quality down, crop away spare background and avoid noisy low-light shots. A 1000–1500 pixel wide image at 75–85% quality looks clean at 100 KB.",
  },
  {
    question: "Is 100KB good quality for a photo?",
    answer:
      "For screens, yes: 100 KB holds a sharp image around 1000–1200 pixels wide. It isn't enough for large prints, so keep the original for printing.",
  },
  {
    question: "Should I compress or resize to get under 100KB?",
    answer:
      "Leave it to the tool unless the form fixes the pixel size. It compresses first and holds quality around 78% or more by trimming dimensions too. If the dimensions must stay, switch off Allow smaller dimensions.",
  },
];

export default function HundredKbPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Image to 100KB Online"
      intro={
        <p>
          100 KB is a common limit on job portals, profile pictures and application forms, and roomy enough for a sharp
          100KB photo. Add your image and compare before and after; nothing is uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to Resize an Image to 100KB</h2>
          <ol>
            <li>Add, drop or paste a JPG, PNG or WebP photo. 100 KB is preselected.</li>
            <li>
              Leave <strong>Allow smaller dimensions</strong> on, or turn it off if the pixel size must stay the same.
            </li>
            <li>
              Optional: set a maximum width or a quality ceiling under <strong>More options</strong>.
            </li>
            <li>Select <strong>Resize to 100 KB</strong>, compare size, dimensions and quality, then download.</li>
          </ol>

          <h2>Reduce a JPG or PNG to 100KB</h2>
          <p>
            No encoder can be asked for &ldquo;exactly 100 KB&rdquo;, so the tool encodes, measures the real file and adjusts,
            up to about 20 times, keeping the best version at or below the target. It prefers modestly smaller dimensions to
            crushed quality. PNGs and screenshots become JPG, with transparency filled white. From our detailed test images:
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">Starting image</th>
                <th scope="col">Result under 100 KB</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>12-megapixel photo (4000 × 3000)</td>
                <td>about 1245 × 933 px at 78% quality</td>
              </tr>
              <tr>
                <td>Portrait (1200 × 1600)</td>
                <td>about 862 × 1149 px at 78% quality</td>
              </tr>
              <tr>
                <td>Screenshot (1280 × 800)</td>
                <td>kept at 1280 × 800 px, 92% quality</td>
              </tr>
            </tbody>
          </table>

          <h2>If a form rejects your 100KB photo</h2>
          <ol>
            <li>
              <strong>Size:</strong> some systems use 1 KB = 1,000 bytes, so choose Custom and enter 97.
            </li>
            <li>
              <strong>Format:</strong> most want JPG. Don&apos;t rename a PNG to .jpg; this tool converts it properly.
            </li>
            <li>
              <strong>Pixel size:</strong> set it with the <Link href="/tools/image-resizer">image resizer</Link>, then come
              back with &ldquo;Allow smaller dimensions&rdquo; off.
            </li>
            <li>
              <strong>Content rules:</strong> <Link href="/tools/neet-photo">NEET photo</Link> and{" "}
              <Link href="/tools/passport-photo">passport photo requirements</Link> list them with official sources.
            </li>
          </ol>

          <h2>Other common sizes</h2>
          <p>
            Tighter limit? Use the <Link href="/tools/50kb-photo">50KB photo resizer</Link> or the{" "}
            <Link href="/tools/20kb-photo">20KB photo resizer</Link>. More room? Try the{" "}
            <Link href="/tools/200kb-photo">200KB photo resizer</Link>. Any other number works with{" "}
            <Link href="/tools/resize-image-to-kb">resize image to an exact KB size</Link>, and the{" "}
            <Link href="/tools/image-compressor">image compressor</Link> lets you choose quality directly.
          </p>

          <PrivacyNote>
            <p>Every encode in the size search happens on your device; your photo is never uploaded or kept.</p>
          </PrivacyNote>
        </>
      }
    >
      <TargetSizeTool
        tool="100kb-photo"
        defaultTargetKB={100}
        presetsKB={[50, 75, 100, 150, 200]}
        events={{ started: "kb_photo_started", completed: "kb_photo_completed", downloaded: "photo_downloaded" }}
      />
    </ToolPageShell>
  );
}
