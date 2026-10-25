import type { Metadata } from "next";
import Link from "next/link";
import { FormatConverterTool, type ConverterConfig } from "@/components/tools/format-converter-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("png-to-jpg");

const description =
  "Convert PNG images to JPG online for free. Choose a background colour for transparent areas, set the JPG quality and download a smaller file. No upload.";

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
};

const faqs: FaqItem[] = [
  {
    question: "What happens to transparent areas when converting PNG to JPG?",
    answer:
      "They get a solid fill, since JPG has no transparency. The converter detects it and lets you choose white, black or a custom colour; semi-transparent edges are blended onto that colour so they stay smooth.",
  },
  {
    question: "Why did my transparent PNG get a black background elsewhere?",
    answer:
      "Some converters drop the transparency information, and the hidden colour behind it, often black, shows through. Here transparent areas always get the background you pick, white by default.",
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
          Convert PNG images to JPG for smaller files that work everywhere. Pick a background colour for transparent areas
          and set the quality; your image is never uploaded.
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
            <li>Adjust the JPG quality for a smaller file, convert again and download.</li>
          </ol>

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
            or <Link href="/tools/image-compressor">compress the PNG</Link> instead. For a strict limit,{" "}
            <Link href="/tools/resize-image-to-kb">resize an image to a target size in KB</Link> takes PNGs and outputs a JPG.
            Saved a WebP from a website? Use <Link href="/tools/webp-to-jpg">WebP to JPG</Link>.
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
