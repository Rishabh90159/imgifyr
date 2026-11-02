import type { Metadata } from "next";
import Link from "next/link";
import { FormatConverterTool, type ConverterConfig } from "@/components/tools/format-converter-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("webp-to-png");

const description =
  "Convert WebP images to PNG online for free. Transparent backgrounds stay transparent and every pixel is kept, so the PNG opens in any editor. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "WebP to PNG Converter – Convert WebP to PNG Online",
  description,
  path: tool.path,
});

const config: ConverterConfig = {
  tool: "webp-to-png",
  from: ["image/webp"],
  to: "image/png",
  reverse: { href: "/tools/jpg-to-webp", label: "Convert JPG or PNG to WebP instead" },
};

const faqs: FaqItem[] = [
  {
    question: "Does WebP to PNG keep the transparent background?",
    answer:
      "Yes. PNG stores transparency just like WebP, so logos, stickers and cut-outs keep their see-through areas and soft edges exactly.",
  },
  {
    question: "Will the PNG lose quality?",
    answer:
      "No. PNG is lossless, so every pixel of the WebP is copied as it is. Detail a lossy WebP had already dropped can't be brought back, though.",
  },
  {
    question: "Why won't my editor open WebP files?",
    answer:
      "Older versions of Paint, Photoshop, PowerPoint and many online form builders were made before WebP became common. A PNG opens in all of them.",
  },
  {
    question: "Why is the PNG so much bigger?",
    answer:
      "WebP compresses far more than PNG, and a photo saved without loss needs many more bytes. For photos without transparency, a JPG is smaller.",
  },
  {
    question: "What happens to an animated WebP?",
    answer: "A PNG holds one still image, so the first frame of the animation is saved.",
  },
  {
    question: "Is my WebP uploaded?",
    answer: "No. The conversion runs inside your browser and the image stays on your device.",
  },
];

export default function WebpToPngPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="WebP to PNG Converter"
      intro={
        <p>
          Turn a WebP image into a PNG that every editor, slide app and design tool can open. Transparency and every pixel are
          kept exactly.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert WebP to PNG</h2>
          <ol>
            <li>Choose, drop or paste a .webp file.</li>
            <li>It is saved as a PNG straight away, with transparent areas intact.</li>
            <li>Check the preview and download the PNG.</li>
          </ol>

          <h2>PNG or JPG?</h2>
          <p>
            Pick PNG for logos, icons, screenshots and anything with a transparent background, or when you will edit the image
            further. For ordinary photos you only need to share or upload, the{" "}
            <Link href="/tools/webp-to-jpg">WebP to JPG converter</Link> gives a much smaller file.
          </p>

          <h2>Making the PNG smaller</h2>
          <p>
            A lossless PNG can be several times the size of the WebP. Reduce its dimensions with{" "}
            <Link href="/tools/resize-png">resize PNG</Link>, which keeps transparency, or shrink it with the{" "}
            <Link href="/tools/image-compressor">image compressor</Link>. If the image is going back onto a website,
            keeping the WebP is usually better: it loads faster, and every current browser shows it.
          </p>

          <PrivacyNote>
            <p>The WebP is converted on your device and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <FormatConverterTool config={config} />
    </ToolPageShell>
  );
}
