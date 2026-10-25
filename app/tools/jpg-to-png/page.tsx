import type { Metadata } from "next";
import Link from "next/link";
import { FormatConverterTool, type ConverterConfig } from "@/components/tools/format-converter-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("jpg-to-png");

const description =
  "Convert JPG and JPEG images to PNG online for free. Lossless PNG output with no extra compression, converted in your browser with no upload.";

export const metadata: Metadata = pageMetadata({
  title: "JPG to PNG Converter – Convert JPG Images to PNG Online",
  description,
  path: tool.path,
});

const config: ConverterConfig = {
  tool: "jpg-to-png",
  from: ["image/jpeg"],
  to: "image/png",
  reverse: { href: "/tools/png-to-jpg", label: "Convert PNG to JPG instead" },
};

const faqs: FaqItem[] = [
  {
    question: "Does converting JPG to PNG improve image quality?",
    answer:
      "No. JPG compression has already removed some detail. The PNG keeps the image exactly as it is now and prevents further loss when you edit and re-save, but it can't bring back what's gone.",
  },
  {
    question: "Will the PNG have a transparent background?",
    answer:
      "No. A JPG has no transparency, so the PNG keeps the same solid background. Removing a background is a separate editing step; afterwards, PNG can store the transparent areas.",
  },
  {
    question: "Why is the PNG file bigger than the JPG?",
    answer:
      "PNG compression is lossless and stores every pixel exactly. Photos have lots of subtle variation that it can't shrink much, so a photo as PNG is often several times larger. That's normal.",
  },
  {
    question: "What's the difference between JPG and JPEG?",
    answer:
      "None. They are the same format; .jpg became common because older versions of Windows only allowed three-letter file extensions. This converter accepts both.",
  },
  {
    question: "Can I convert several JPGs at once?",
    answer:
      "This page converts one image at a time: pick the next one after downloading. For a whole batch, the bulk image resizer can save many images as PNG and download them as a ZIP.",
  },
  {
    question: "Is my image uploaded during conversion?",
    answer:
      "No. Your browser decodes the JPG and encodes the PNG locally on your device. The image is not uploaded or stored anywhere.",
  },
];

export default function JpgToPngPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="JPG to PNG Converter"
      intro={
        <p>
          Convert JPG and JPEG images to PNG in one step. The PNG keeps every pixel of your JPG exactly, with no further
          compression loss, and your image is never uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert JPG to PNG</h2>
          <ol>
            <li>Choose, drop or paste a JPG or JPEG image.</li>
            <li>The image is converted to PNG automatically.</li>
            <li>Compare the original and converted file, then select <strong>Download PNG</strong>.</li>
          </ol>

          <h2>JPG vs PNG</h2>
          <table>
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">JPG / JPEG</th>
                <th scope="col">PNG</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Compression</th>
                <td>Lossy: smaller files, some detail discarded</td>
                <td>Lossless: every pixel kept exactly</td>
              </tr>
              <tr>
                <th scope="row">Transparency</th>
                <td>Not supported</td>
                <td>Supported</td>
              </tr>
              <tr>
                <th scope="row">Best for</th>
                <td>Photos</td>
                <td>Screenshots, graphics, logos, text, images you&apos;ll keep editing</td>
              </tr>
              <tr>
                <th scope="row">Typical file size for photos</th>
                <td>Small</td>
                <td>Often several times larger</td>
              </tr>
            </tbody>
          </table>

          <h2>When to convert JPG to PNG</h2>
          <ul>
            <li>
              <strong>Editing in several rounds:</strong> each JPG re-save loses a little more detail; PNG stops that.
            </li>
            <li>
              <strong>Software or forms that require PNG</strong>, such as some design tools and app stores.
            </li>
            <li>
              <strong>Preparing for transparency:</strong> converting adds none, but PNG can store it once you remove the
              background.
            </li>
            <li>
              <strong>Graphics saved as JPG by mistake</strong>, so further edits don&apos;t make them worse.
            </li>
          </ul>
          <p>
            The PNG won&apos;t look sharper: JPG artefacts stay as they are, and the file is larger. If size matters more,{" "}
            <Link href="/tools/image-compressor">compress the image</Link> instead. Going the other way?{" "}
            <Link href="/tools/png-to-jpg">Convert PNG to JPG</Link>. Just renaming .jpeg to .jpg? Use{" "}
            <Link href="/tools/jpeg-to-jpg">JPEG to JPG</Link>; for documents, <Link href="/tools/jpg-to-pdf">JPG to PDF</Link>.
          </p>

          <PrivacyNote>
            <p>The JPG is decoded and saved as PNG by your own browser; no copy is sent to a server.</p>
          </PrivacyNote>
        </>
      }
    >
      <FormatConverterTool config={config} />
    </ToolPageShell>
  );
}
