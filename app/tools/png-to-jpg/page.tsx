import type { Metadata } from "next";
import Link from "next/link";
import { FormatConverterTool, type ConverterConfig } from "@/components/tools/format-converter-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("png-to-jpg");

const description =
  "Convert PNG to JPG online for free, under 20, 50, 100 or 200 KB when a form sets a limit. Choose a background for transparent areas and download. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "PNG to JPG Converter – Convert PNG Images to JPG Online",
  description,
  path: tool.path,
});

const config: ConverterConfig = {
  tool: "png-to-jpg",
  from: ["image/png"],
  to: "image/jpeg",
  reverse: { href: "/tools/jpg-to-png", label: "Convert JPG to PNG instead" },
  maxSizesKB: [20, 50, 100, 200, 500],
};

const faqs: FaqItem[] = [
  {
    question: "What happens to transparent areas when converting PNG to JPG?",
    answer:
      "They get a solid fill, since JPG has no transparency. The converter detects it and lets you choose white, black or a custom colour; semi-transparent edges are blended onto that colour so they stay smooth.",
  },
  {
    question: "How do I convert a PNG to JPG under 50 KB?",
    answer:
      "Drop the PNG, choose 50 KB under Maximum file size and download. The JPG quality is lowered step by step, and the pixel size only shrinks if quality alone can't reach 50 KB.",
  },
  {
    question: "What JPG quality should I choose?",
    answer:
      "The default 90% keeps photos and most graphics crisp. 75–85% gives noticeably smaller files with little visible difference for photos. Stay at 90% or higher for images containing text.",
  },
  {
    question: "Will converting PNG to JPG reduce quality?",
    answer:
      "Slightly, because JPG is lossy. For photos it's usually invisible at high settings, but sharp text, line art and flat-colour graphics show artefacts more easily, so those are often better left as PNG.",
  },
  {
    question: "Is PNG to JPEG the same as PNG to JPG?",
    answer: "Yes. JPG and JPEG are two names for one format. The file you download ends in .jpg, which is accepted anywhere JPEG is.",
  },
  {
    question: "Are my PNG files uploaded?",
    answer:
      "No. The conversion runs in your browser on your device. Your PNG isn't sent to a server and isn't stored after you leave the page.",
  },
];

export default function PngToJpgPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="PNG to JPG Converter"
      intro={
        <p>
          Convert PNG images to JPG for smaller files that work everywhere, with an optional limit such as 50 KB. Pick a
          background colour for transparent areas; your image is never uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert PNG to JPG</h2>
          <ol>
            <li>Choose, drop or paste a PNG. It&apos;s converted to JPG right away using sensible defaults.</li>
            <li>If the PNG has transparent areas, choose a background colour.</li>
            <li>Adjust the JPG quality, or pick a maximum file size, then convert again and download.</li>
          </ol>

          <h2>PNG to JPG under 20, 50, 100 or 200 KB</h2>
          <p>
            PNG screenshots and scans are often several megabytes, far above what upload forms allow. Choose a maximum size
            and the converter searches for the best JPG quality that fits, so text stays as readable as the limit permits. The
            result shows the exact size in KB before you download.
          </p>

          <h2>Transparency and background colour</h2>
          <p>
            JPG can&apos;t store transparent pixels, so each one needs a solid colour. Soft edges such as anti-aliased text or
            shadows are blended onto it, so they stay smooth instead of jagged.
          </p>
          <ul>
            <li>
              <strong>White</strong> suits documents, product photos and most websites.
            </li>
            <li>
              <strong>Black</strong> suits dark designs and presentations.
            </li>
            <li>
              <strong>Custom</strong> matches the page or slide where the image will appear.
            </li>
          </ul>

          <h2>PNG vs JPG: when to switch</h2>
          <p>
            Photos saved as PNG can become several times smaller as JPG at 80–90% quality, which helps with JPG-only upload
            forms and email limits. Keep PNG for screenshots with small text, logos and anything that must stay transparent,
            or <Link href="/tools/image-compressor">compress the PNG</Link> instead. For a size range with a minimum as well,{" "}
            <Link href="/tools/resize-image-to-kb">resize an image to a target size in KB</Link>. For websites,{" "}
            <Link href="/tools/jpg-to-webp">PNG to WebP</Link> keeps transparency in a small file.
          </p>

          <PrivacyNote>
            <p>Your PNG is converted to JPG by your own browser and never leaves your device.</p>
          </PrivacyNote>
        </>
      }
    >
      <FormatConverterTool config={config} />
    </ToolPageShell>
  );
}
