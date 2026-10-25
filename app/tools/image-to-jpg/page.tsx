import type { Metadata } from "next";
import Link from "next/link";
import { FormatConverterTool, type ConverterConfig } from "@/components/tools/format-converter-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("image-to-jpg");

const description =
  "Convert any image to JPG: PNG, WebP, HEIC, GIF, BMP or AVIF. Optionally keep the JPG under 20, 50, 100 or 200 KB for forms. Free, in your browser, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Image to JPG Converter – PNG, WebP, HEIC, AVIF to JPG",
  description,
  path: tool.path,
});

const config: ConverterConfig = {
  tool: "image-to-jpg",
  from: ["image/png", "image/webp", "image/heic", "image/gif", "image/bmp", "image/avif"],
  to: "image/jpeg",
  reverse: { href: "/tools/resize-image-to-kb", label: "Already a JPG? Make it smaller, such as 100 KB" },
  maxSizesKB: [20, 50, 100, 200, 500],
};

const faqs: FaqItem[] = [
  {
    question: "How do I convert an image to JPG?",
    answer:
      "Drop or choose the picture and it's converted straight away, whatever its format. Change the quality or background colour and convert again for a different result, then download the JPG.",
  },
  {
    question: "Can I convert a photo to a JPG under 50 KB or 100 KB?",
    answer:
      "Yes. Pick a maximum file size and convert again. The tool uses the highest quality that fits, reduces the pixel dimensions only if quality alone can't reach the limit, and shows the exact size.",
  },
  {
    question: "Which formats can I convert?",
    answer:
      "PNG, WebP, iPhone HEIC and HEIF, GIF, BMP and AVIF. Your browser decodes BMP and AVIF itself, so a very old browser may not open AVIF. TIFF isn't supported.",
  },
  {
    question: "What happens to an animated GIF?",
    answer:
      "A JPG holds one picture, so only the first frame is kept. To change the size of an animated GIF and keep it moving, use the GIF resizer instead.",
  },
  {
    question: "What happens to transparent areas?",
    answer:
      "They're filled with a solid colour, because JPG has no transparency. White is used unless you pick black or another colour before converting.",
  },
  {
    question: "Are my images uploaded?",
    answer: "No. The image is decoded and saved as a JPG by your browser, on your device. It isn't sent to Imgifyr or anywhere else.",
  },
];

export default function ImageToJpgPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Image to JPG Converter: Any Format to JPG"
      intro={
        <p>
          Turn a picture in almost any format into a JPG that every app, website and form accepts. Set a limit such as 50 KB
          or 100 KB to keep it small. Nothing is uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert a picture to JPG</h2>
          <ol>
            <li>Choose or drop the image: PNG, WebP, HEIC, GIF, BMP or AVIF.</li>
            <li>Optionally pick a maximum file size. Otherwise the JPG is saved at 90% quality, which you can adjust.</li>
            <li>Download the JPG, or change a setting and convert again.</li>
          </ol>

          <h2>Supported formats</h2>
          <ul>
            <li>
              <strong>WebP and AVIF to JPG:</strong> pictures saved from websites often arrive in these, and some forms reject
              both.
            </li>
            <li>
              <strong>HEIC:</strong> the iPhone photo format. See <Link href="/tools/heic-to-jpg">HEIC to JPG</Link>.
            </li>
            <li>
              <strong>PNG and BMP:</strong> usually much smaller as JPG. See <Link href="/tools/png-to-jpg">PNG to JPG</Link>.
            </li>
            <li>
              <strong>GIF:</strong> only the first frame becomes the JPG.
            </li>
          </ul>

          <h2>Convert image to JPG for a form with a KB limit</h2>
          <p>
            Exam, job and government forms often want a JPG under a set size. Choose a limit and the conversion meets it in
            one step. For exact pixel dimensions, use the <Link href="/tools/image-resizer">image resizer</Link>{" "}
            or the <Link href="/tools/50kb-photo">50KB photo resizer</Link>; if there&apos;s a minimum size too, try the{" "}
            <Link href="/tools/image-size-increase">image size increaser</Link>.
          </p>

          <PrivacyNote>
            <p>Pictures are converted on your device, so photos of documents and IDs stay private.</p>
          </PrivacyNote>
        </>
      }
    >
      <FormatConverterTool config={config} />
    </ToolPageShell>
  );
}
