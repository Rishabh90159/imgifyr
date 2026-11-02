import type { Metadata } from "next";
import Link from "next/link";
import { FormatConverterTool, type ConverterConfig } from "@/components/tools/format-converter-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("jpg-to-webp");

const description =
  "Convert JPG and PNG images to WebP online for free. Smaller files for faster websites, PNG transparency kept, optional size limit. Converted in your browser.";

export const metadata: Metadata = pageMetadata({
  title: "JPG to WebP Converter – Convert JPG & PNG to WebP",
  description,
  path: tool.path,
});

const config: ConverterConfig = {
  tool: "jpg-to-webp",
  from: ["image/jpeg", "image/png"],
  to: "image/webp",
  reverse: { href: "/tools/webp-to-png", label: "Convert WebP to PNG instead" },
  maxSizesKB: [50, 100, 200, 500],
};

const faqs: FaqItem[] = [
  {
    question: "Does converting JPG to WebP lose quality?",
    answer:
      "The picture is compressed once more, so a little detail can change, but at the default 90% quality it's very hard to see. It won't look better than the JPG did.",
  },
  {
    question: "Can I convert PNG to WebP and keep transparency?",
    answer:
      "Yes. WebP supports transparent pixels, so logos and cut-outs keep their see-through background, usually in a much smaller file than the PNG.",
  },
  {
    question: "Why is my WebP bigger than the JPG?",
    answer:
      "That can happen when the JPG was already heavily compressed. Lower the quality slider, or pick a maximum file size and the converter finds the best quality that fits.",
  },
  {
    question: "Which browsers can show WebP images?",
    answer:
      "All current versions of Chrome, Edge, Firefox and Safari display WebP. Some upload forms and older desktop apps still accept only JPG or PNG, so keep the original for those.",
  },
  {
    question: "Can I convert many images to WebP at once?",
    answer: "Yes. The bulk image resizer can save a whole batch as WebP, with or without resizing, and gives you a ZIP.",
  },
  {
    question: "Are my images uploaded?",
    answer: "No. Your browser creates the WebP on your device; nothing is sent to a server.",
  },
];

export default function JpgToWebpPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="JPG to WebP Converter"
      intro={
        <p>
          Convert JPG or PNG images to WebP so web pages load faster. PNG transparency is kept, and you can cap the file size
          in KB.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert JPG or PNG to WebP</h2>
          <ol>
            <li>Choose, drop or paste a JPG or PNG. It is converted to WebP at 90% quality.</li>
            <li>Lower the quality, or choose a maximum size such as 100 KB.</li>
            <li>Compare the before and after sizes, then download the .webp file.</li>
          </ol>

          <h2>How much smaller is WebP?</h2>
          <p>
            Google&apos;s own comparison found lossy WebP files 25–34% smaller than JPGs of similar quality, and lossless WebP
            about 26% smaller than PNG (
            <a href="https://developers.google.com/speed/webp" rel="noopener">
              developers.google.com/speed/webp
            </a>
            ). Results vary by picture: photos and large graphics gain the most.
          </p>

          <h2>Before you switch a site to WebP</h2>
          <p>
            Browsers handle WebP well, but email clients, print shops and many government forms still expect JPG. Keep the
            originals, and convert back with <Link href="/tools/webp-to-png">WebP to PNG</Link> or{" "}
            <Link href="/tools/webp-to-jpg">WebP to JPG</Link> when needed. To change the dimensions too, use{" "}
            <Link href="/tools/resize-webp">resize WebP</Link>.
          </p>

          <PrivacyNote>
            <p>Your images are converted by your own browser and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <FormatConverterTool config={config} />
    </ToolPageShell>
  );
}
