import type { Metadata } from "next";
import Link from "next/link";
import { ImageResizerTool } from "@/components/tools/image-resizer-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("resize-webp");

const description =
  "Resize WebP images by pixels or percentage and save the result as WebP, JPG or PNG. Transparency is kept and animated WebP files are flagged. Free, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Resize WebP Images Online – Save as WebP, JPG or PNG",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Should I save the resized image as WebP, JPG or PNG?",
    answer:
      "Keep WebP for websites and apps you control, since it gives the smallest file. Pick JPG for upload forms, email or older programs, and PNG when you need transparency somewhere WebP isn't accepted.",
  },
  {
    question: "Why does it say WebP isn't available in my browser?",
    answer:
      "Some versions of Safari can open WebP but can't create it, so the resizer saves PNG instead (or JPG if you choose it). Chrome, Edge and Firefox can save WebP.",
  },
  {
    question: "Can I resize an animated WebP?",
    answer:
      "Not with the animation kept. Browsers only let web tools read the first frame, so you get a still image, and the tool warns you. For animated GIFs, the GIF resizer keeps every frame.",
  },
  {
    question: "Does the WebP keep its transparent background?",
    answer:
      "Yes, when you save as WebP or PNG. JPG has no transparency, so transparent areas are filled with white if you choose JPG.",
  },
  {
    question: "What quality should I use for WebP?",
    answer:
      "80–90% works well for photos on websites; WebP at 80% generally matches a higher-quality JPG while being noticeably smaller. Raise it for fine text or sharp graphics.",
  },
  {
    question: "Which widths should I make for responsive images?",
    answer:
      "A common set is 640, 1024, 1600 and 1920 pixels, listed in an img srcset so phones fetch the small file and large screens the big one.",
  },
];

export default function ResizeWebpPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize WebP Images Online"
      intro={
        <p>
          Resize WebP images and choose what you get back: a smaller WebP, a JPG for forms and email, or a PNG with
          transparency. The WebP resize happens in your browser, with no upload.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to resize a WebP image</h2>
          <ol>
            <li>Add a .webp file; pictures saved from websites often are.</li>
            <li>
              Enter a width or height, pick a common width, or switch to <strong>Percentage</strong>.
            </li>
            <li>
              Choose <strong>WebP</strong>, <strong>JPG</strong> or <strong>PNG</strong> output and set the quality.
            </li>
            <li>
              Select <strong>Resize WebP</strong>, compare the sizes, then download.
            </li>
          </ol>

          <h2>WebP, JPG or PNG: which output to choose</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">Save as</th>
                <th scope="col">File size</th>
                <th scope="col">Transparency</th>
                <th scope="col">Best for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>WebP</td>
                <td>Smallest</td>
                <td>Yes</td>
                <td>Your own website, apps, CMS uploads that accept WebP</td>
              </tr>
              <tr>
                <td>JPG</td>
                <td>Small</td>
                <td>No (white background)</td>
                <td>Application forms, email, printing, older software</td>
              </tr>
              <tr>
                <td>PNG</td>
                <td>Largest for photos</td>
                <td>Yes</td>
                <td>Logos and graphics where WebP isn&apos;t accepted</td>
              </tr>
            </tbody>
          </table>
          <p>
            Need only a same-size JPG copy? The <Link href="/tools/webp-to-jpg">WebP to JPG converter</Link> is quicker. For
            a KB limit, use <Link href="/tools/resize-image-to-kb">resize image to KB</Link>.
          </p>

          <h2>Sizing WebP images for websites</h2>
          <p>
            The biggest saving comes from not sending more pixels than a screen shows. A full-width banner rarely needs more
            than 1920 pixels; an article image is usually 800–1280. Making two or three widths for <code>srcset</code> lets
            phones download far less. For a whole set, use the{" "}
            <Link href="/tools/bulk-image-resizer">bulk image resizer</Link>.
          </p>

          <h2>Supported files</h2>
          <p>
            Still WebP images, lossy or lossless, with or without transparency, up to 50 MB, including stickers and pictures
            saved from websites. Animated WebP files open but only their first frame is resized. For JPG photos the <Link href="/tools/resize-jpg">JPG resizer</Link> adds print DPI,
            and the <Link href="/tools/resize-png">PNG resizer</Link> can reduce colours.
          </p>

          <PrivacyNote>
            <p>Your WebP image is decoded and re-encoded by your own browser, and no copy is sent to a server.</p>
          </PrivacyNote>
        </>
      }
    >
      <ImageResizerTool variant="webp" />
    </ToolPageShell>
  );
}
