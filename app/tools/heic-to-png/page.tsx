import type { Metadata } from "next";
import Link from "next/link";
import { FormatConverterTool, type ConverterConfig } from "@/components/tools/format-converter-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("heic-to-png");

const description =
  "Convert HEIC to PNG online for free: turn iPhone photos into lossless PNG files for editing and design apps, with no second round of compression. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "HEIC to PNG Converter – Convert iPhone Photos to PNG",
  description,
  path: tool.path,
});

const config: ConverterConfig = {
  tool: "heic-to-png",
  from: ["image/heic"],
  to: "image/png",
  completedEvent: "heic_conversion_completed",
};

const faqs: FaqItem[] = [
  {
    question: "Is PNG better than JPG for converting HEIC?",
    answer:
      "PNG adds no compression loss of its own, so it's better when you'll keep editing the photo. It can't add detail the HEIC didn't have, and the file is much larger.",
  },
  {
    question: "Why is the PNG file so large?",
    answer:
      "PNG stores a camera photo without lossy compression, so a 12-megapixel iPhone picture can take many megabytes. Resize it first if you don't need every pixel.",
  },
  {
    question: "Can I convert HEIF files too?",
    answer: "Yes. HEIC is a kind of HEIF file, and the converter opens both .heic and .heif photos from iPhones and other cameras.",
  },
  {
    question: "Does the PNG keep the photo's location?",
    answer:
      "No. Only the picture is saved, so GPS position, date taken and camera details are not copied into the PNG. Keep the original if you need that information.",
  },
  {
    question: "Does this work on Windows and Android?",
    answer:
      "Yes. Any modern browser can use it: a HEIC decoder loads into the page the first time you convert, so you don't need to install anything.",
  },
  {
    question: "Are my photos uploaded?",
    answer: "No. Decoding and saving the PNG both happen on your device.",
  },
];

export default function HeicToPngPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="HEIC to PNG Converter"
      intro={
        <p>
          Convert iPhone HEIC or HEIF photos into PNG files for editing, cut-outs and design tools. PNG is lossless, so the
          photo isn&apos;t compressed a second time.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert HEIC to PNG</h2>
          <ol>
            <li>Choose or drop a .heic or .heif photo from your iPhone or iPad.</li>
            <li>The picture is decoded in your browser and saved as a PNG.</li>
            <li>Compare it with the original and download.</li>
          </ol>

          <h2>When PNG is the right choice</h2>
          <p>
            Choose PNG when the photo is a starting point: retouching in an editor, removing the background, or adding it to a
            design where repeated JPG saves would slowly add blur. For sending or uploading, the{" "}
            <Link href="/tools/heic-to-jpg">HEIC to JPG converter</Link> gives a far smaller file.
          </p>

          <h2>Next steps</h2>
          <p>
            Cut out the person or object with the <Link href="/tools/background-remover">background remover</Link>, which keeps
            the PNG transparent, or reduce the pixel count with the <Link href="/tools/image-resizer">image resizer</Link>.
          </p>

          <PrivacyNote>
            <p>Your iPhone photos are converted in your browser and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <FormatConverterTool config={config} />
    </ToolPageShell>
  );
}
