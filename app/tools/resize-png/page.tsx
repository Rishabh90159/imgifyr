import type { Metadata } from "next";
import Link from "next/link";
import { ImageResizerTool } from "@/components/tools/image-resizer-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("resize-png");

const description =
  "Resize PNG images by pixels or percentage and keep the transparent background. Optional colour reduction makes the PNG far smaller. Free, runs in your browser.";

export const metadata: Metadata = pageMetadata({
  title: "Resize PNG Online – Keep Transparency, Shrink File Size",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Will my PNG keep its transparent background?",
    answer:
      "Yes. The result is always a PNG with transparent and semi-transparent pixels kept. Premultiplied alpha scaling avoids the dark or white fringe some resizers leave around cut-out logos.",
  },
  {
    question: "Why is my resized PNG still large?",
    answer:
      "PNG is lossless, so a photo stored as PNG stays big. Turn on “Reduce colours” for a palette of up to 256 colours, often 50–80% smaller. For photos without transparency, converting PNG to JPG gives the smallest file.",
  },
  {
    question: "How many colours should I keep?",
    answer:
      "256 looks identical for almost every logo, chart and screenshot. 128 or 64 suit flat graphics, and 32 simple icons. If a gradient shows bands, keep 256 with dithering on.",
  },
  {
    question: "What is dithering?",
    answer:
      "Dithering mixes neighbouring pixels of the remaining colours so gradients stay smooth instead of turning into stripes. Turn it off for flat artwork with sharp edges, where it can add a faint speckle.",
  },
  {
    question: "How do I make @2x images for a website?",
    answer:
      "Keep the large version as your @2x file, then resize a copy to exactly 50% here for @1x. Percentage mode does it in one step with exact proportions.",
  },
  {
    question: "Can I resize a JPG or WebP on this page?",
    answer:
      "This page is for PNG files. The image resizer accepts JPG, PNG, WebP and HEIC, and the JPG and WebP resizers have settings specific to those formats.",
  },
];

export default function ResizePngPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize PNG Images Without Losing Transparency"
      intro={
        <p>
          Resize PNG online and keep the transparent background of logos, icons and cut-outs. This PNG resizer can also
          reduce colours in the same step for a lighter file, all on your device.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to resize a PNG</h2>
          <ol>
            <li>Choose, drop or paste a .png file.</li>
            <li>
              Set a width or height in pixels, or use <strong>Percentage</strong>; 50% turns an @2x graphic into @1x.
            </li>
            <li>
              For a smaller file, tick <strong>Reduce colours</strong> and pick how many to keep.
            </li>
            <li>
              Select <strong>Resize PNG</strong>, check the transparent areas on the checkerboard preview, then download.
            </li>
          </ol>

          <h2>Why PNG files stay big, and how colour reduction helps</h2>
          <p>
            A PNG keeps every pixel exactly, which suits sharp text but is costly for photos with millions of shades. Colour
            reduction, the same idea as pngquant, stores up to 256 colours once plus a short reference per pixel. If the
            image already uses few enough colours, they are kept exactly.
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">Colours</th>
                <th scope="col">Good for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>256</td>
                <td>Screenshots, charts, detailed logos, UI images</td>
              </tr>
              <tr>
                <td>128 / 64</td>
                <td>Flat illustrations, diagrams, logos with a few brand colours</td>
              </tr>
              <tr>
                <td>32</td>
                <td>Simple icons and line art</td>
              </tr>
            </tbody>
          </table>
          <p>
            A photo with no transparency is always smaller as a JPG: <Link href="/tools/png-to-jpg">convert the PNG to
            JPG</Link>. To shrink a PNG without changing its dimensions, use the{" "}
            <Link href="/tools/image-compressor">image compressor</Link>.
          </p>

          <h2>Supported files</h2>
          <p>
            PNG images up to 50 MB and 100 megapixels, including 8-bit palette PNGs and PNGs with an alpha channel. For other
            formats, use the <Link href="/tools/resize-jpg">JPG resizer</Link> (quality and print DPI), the{" "}
            <Link href="/tools/resize-webp">WebP resizer</Link>, the <Link href="/tools/image-resizer">image resizer</Link> for
            iPhone HEIC photos, or the <Link href="/tools/resize-gif">GIF resizer</Link>, which keeps animations moving.
          </p>

          <h2>When a PNG resize helps</h2>
          <ul>
            <li>Logos for websites and documents: 400–800 px is typical, not a 4000 px export.</li>
            <li>Screenshots for guides and support tickets: smaller, with text still readable.</li>
            <li>
              Product cut-outs: <Link href="/tools/background-remover">remove the background</Link>, then match your
              shop&apos;s size.
            </li>
            <li>
              Logos that must scale to any size: trace them with <Link href="/tools/png-to-svg">PNG to SVG</Link> instead.
            </li>
          </ul>

          <PrivacyNote>
            <p>The PNG is scaled and, if you choose, palette-reduced inside your browser; no part of it is uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <ImageResizerTool variant="png" />
    </ToolPageShell>
  );
}
