import type { Metadata } from "next";
import Link from "next/link";
import { FormatConverterTool, type ConverterConfig } from "@/components/tools/format-converter-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("webp-to-jpg");

const description =
  "Convert WebP images to JPG online for free. Turn pictures saved from websites into JPGs that any app or upload form accepts. Converted in your browser.";

export const metadata: Metadata = pageMetadata({
  title: "WebP to JPG Converter – Convert WebP to JPG Online",
  description,
  path: tool.path,
});

const config: ConverterConfig = {
  tool: "webp-to-jpg",
  from: ["image/webp"],
  to: "image/jpeg",
};

const faqs: FaqItem[] = [
  {
    question: "Why do images I save from websites end up as WebP?",
    answer:
      "Many sites serve WebP because it makes pages load faster. Saving the picture gives you the file exactly as the site sent it, .webp extension included, even though the page displayed it like any other image.",
  },
  {
    question: "Does converting WebP to JPG lose quality?",
    answer:
      "A little, since the picture is saved again with JPG compression; at the default 90% it's very hard to see. Detail the WebP already lost can't come back, so the JPG looks the same, not better.",
  },
  {
    question: "Why is the JPG bigger than the WebP?",
    answer:
      "WebP usually needs fewer bytes than JPG for the same picture. To shrink the JPG, lower the quality slider or run it through the image compressor or the resize to KB tool.",
  },
  {
    question: "What happens to a transparent WebP?",
    answer:
      "You choose a background (white, black or custom) and transparent areas and soft edges are blended onto it. If the transparency must survive, convert to PNG instead of JPG.",
  },
  {
    question: "Can I convert an animated WebP?",
    answer: "Only as a still picture. A JPG holds a single image, so the converter saves the first frame of the animation.",
  },
  {
    question: "Is my WebP uploaded?",
    answer: "No. Your browser decodes the WebP and creates the JPG on your device. The image isn't sent to a server.",
  },
];

export default function WebpToJpgPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="WebP to JPG Converter"
      intro={
        <p>
          Saved an image from a website and got a .webp file your app or upload form won&apos;t accept? Convert it to a JPG
          here, right in your browser.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert WebP to JPG</h2>
          <ol>
            <li>Choose, drop or paste a WebP image. It becomes a JPG straight away at 90% quality.</li>
            <li>If it has transparent areas, pick the background colour the JPG should use.</li>
            <li>Lower the quality for a smaller file, compare the sizes and download.</li>
          </ol>

          <h2>WebP vs JPG</h2>
          <p>
            WebP is Google&apos;s format for the web. Browsers show it without trouble, but some editors, print shops and most
            exam and job portals still ask for JPG or PNG.
          </p>
          <ul>
            <li><strong>Compatibility:</strong> JPG works almost everywhere; WebP in browsers and newer apps.</li>
            <li><strong>File size:</strong> WebP is usually smaller, so expect a larger JPG.</li>
            <li><strong>Transparency:</strong> WebP supports it; JPG gets a background colour.</li>
            <li><strong>Animation:</strong> WebP can move; a JPG is always one still picture.</li>
          </ul>

          <h2>After converting</h2>
          <p>
            Forms often pair a JPG requirement with a size limit. <Link href="/tools/resize-image-to-kb">Resize image to KB</Link>{" "}
            reaches limits such as 50 KB or 100 KB and accepts WebP directly, or change dimensions with the{" "}
            <Link href="/tools/image-resizer">image resizer</Link>. To keep transparency, the{" "}
            <Link href="/tools/image-compressor">image compressor</Link> can shrink it as WebP. PNG files? Try{" "}
            <Link href="/tools/png-to-jpg">PNG to JPG</Link>.
          </p>

          <PrivacyNote>
            <p>The WebP is converted by your own browser and isn&apos;t uploaded; the JPG contains only the picture, not its metadata.</p>
          </PrivacyNote>
        </>
      }
    >
      <FormatConverterTool config={config} />
    </ToolPageShell>
  );
}
