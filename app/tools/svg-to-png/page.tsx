import type { Metadata } from "next";
import Link from "next/link";
import { SvgToPngTool } from "@/components/tools/svg-to-png-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("svg-to-png");

const description =
  "Convert SVG graphics to PNG online at any size. Choose exact pixel dimensions, keep a transparent background or add a colour, then download your PNG.";

export const metadata: Metadata = pageMetadata({
  title: "SVG to PNG Converter – Convert SVG to PNG at Any Size",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What size should my PNG be?",
    answer:
      "The size it will be displayed at, doubled for sharp results on Retina screens: a logo shown at 200 × 60 pixels looks crisp as a 400 × 120 PNG. The quick-size buttons multiply the SVG's own size by 1–4.",
  },
  {
    question: "Will the PNG keep the transparent background?",
    answer:
      "Yes. Transparent areas of the SVG stay transparent in the PNG unless you choose a white or custom background colour.",
  },
  {
    question: "Why does my PNG look different from the SVG in my design app?",
    answer:
      "Your browser renders the PNG, so fonts not embedded in the SVG, external images and some editor-specific effects can't be used. Convert text to outlines in your design tool before exporting for an exact match.",
  },
  {
    question: "Is it safe to open an SVG from someone else?",
    answer:
      "SVG files can contain scripts and links. This tool removes scripts, event handlers, embedded HTML and external links, then renders the file as an image, where browsers run no scripts. Anything removed is listed.",
  },
  {
    question: "Can I convert PNG back to SVG?",
    answer:
      "Not by changing the format: a PNG has pixels, not shapes. The PNG to SVG converter traces the pixels into vector paths, which suits logos and icons but not photos.",
  },
  {
    question: "Is my SVG uploaded?",
    answer: "No. Reading, cleaning and rendering the SVG all happen in your browser. The file never leaves your device.",
  },
];

export default function SvgToPngPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="SVG to PNG Converter"
      intro={
        <p>
          Turn an SVG logo, icon or illustration into a PNG at exactly the pixel size you need, with a transparent or solid
          background. Everything runs in your browser, and unsafe SVG content is stripped before rendering.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert SVG to PNG</h2>
          <ol>
            <li>Choose or drop an .svg file. It&apos;s checked, cleaned and rendered at its own size right away.</li>
            <li>Set the output width and height, or use a quick size such as 2× or 4×.</li>
            <li>Keep the background transparent or pick a colour, then download the PNG.</li>
          </ol>

          <h2>Vector vs raster: choosing the size</h2>
          <p>
            An SVG is a <strong>vector</strong> image that can be drawn sharply at any size; a PNG is a{" "}
            <strong>raster</strong> grid of pixels fixed when you convert. Render at the final display size, or 2× for
            high-resolution screens, since enlarging the PNG later blurs it. Keep &ldquo;Maintain aspect ratio&rdquo; on, or use
            &ldquo;Fit inside&rdquo; to add transparent space instead of stretching. Large PNGs can be{" "}
            <Link href="/tools/image-compressor">compressed</Link> or <Link href="/tools/image-resizer">resized</Link> later.
          </p>

          <h2>How unsafe SVG content is handled</h2>
          <p>
            An SVG file is code: it can include JavaScript, event handlers like <code>onload</code>, embedded web pages and
            links to other servers. The tool parses it without running anything, removes those, blocks XML tricks that can
            freeze a browser, and shows the result only as an image, where scripts are disabled. You&apos;ll see a notice if
            anything was removed. Need the reverse? The <Link href="/tools/png-to-svg">PNG to SVG converter</Link> traces a
            PNG into paths.
          </p>

          <PrivacyNote>
            <p>
              Nothing is uploaded, and the site&apos;s security policy blocks requests to other servers, so even a hostile SVG
              can&apos;t call home.
            </p>
          </PrivacyNote>
        </>
      }
    >
      <SvgToPngTool />
    </ToolPageShell>
  );
}
