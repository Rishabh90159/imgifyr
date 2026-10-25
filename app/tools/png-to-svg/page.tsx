import type { Metadata } from "next";
import Link from "next/link";
import { PngToSvgTool } from "@/components/tools/png-to-svg-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("png-to-svg");

const description =
  "Convert PNG logos, icons and simple graphics into true vector SVG using image tracing. Adjust colours, detail and background, then download your SVG.";

export const metadata: Metadata = pageMetadata({
  title: "PNG to SVG Converter – Trace PNG Images to Vector",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Is the result a real vector SVG?",
    answer:
      "Yes. The output contains only vector <path> shapes traced from your image. It doesn't wrap the PNG inside an SVG, which some converters do and which brings none of a vector file's benefits.",
  },
  {
    question: "Why doesn't my photo convert well?",
    answer:
      "Photos are full of gradients, texture and noise. Tracing turns each patch of similar colour into its own shape, so a photo becomes thousands of blotches and a huge file. Logos, icons and line art trace best.",
  },
  {
    question: "How many colours should I choose?",
    answer:
      "Roughly the number of distinct colours in the image: 2–3 for a two-colour logo, 8–16 for a flat illustration. Extra colours mostly capture anti-aliased edges and add paths without improving the result.",
  },
  {
    question: "When should I use black & white mode?",
    answer:
      "For signatures, stamps, line drawings, scanned text and one-colour logos. A higher threshold keeps more of faint strokes; a lower one removes grey smudges.",
  },
  {
    question: "Can I edit the SVG afterwards?",
    answer:
      "Yes. Open it in Inkscape, Illustrator, Affinity Designer or Figma. Each colour is a single path you can recolour, simplify or reshape.",
  },
  {
    question: "Is my image uploaded?",
    answer: "No. Tracing runs in a background thread in your browser. Your image never leaves your device.",
  },
];

export default function PngToSvgPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="PNG to SVG Converter: Trace Images into Vectors"
      intro={
        <p>
          Turn a PNG logo, icon or simple graphic into a scalable SVG made of real vector paths. Choose colour or black &amp;
          white tracing and the level of detail; it all runs in your browser.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert PNG to SVG</h2>
          <ol>
            <li>Choose or drop a PNG (JPG and WebP also work). It&apos;s traced right away with balanced settings.</li>
            <li>
              Pick <strong>Colour</strong> or <strong>Black &amp; white</strong>, then set the number of colours or the
              threshold.
            </li>
            <li>Choose the detail level, and remove the background colour for a transparent SVG.</li>
            <li>Compare the original with the traced SVG, then download.</li>
          </ol>

          <h2>Raster vs vector: how tracing works</h2>
          <p>
            A PNG is a <strong>raster</strong> grid of pixels; an SVG holds <strong>vector</strong> outlines that scale without
            blurring. Renaming the file can&apos;t bridge the two, so the shapes are rebuilt by <em>tracing</em>: colours are
            reduced, the edges of each region are found, lines and curves are fitted to them, and each colour becomes one
            path. The engine is ImageTracer.js, a public-domain tracer that runs in the browser.
          </p>

          <h2>What traces well</h2>
          <ul>
            <li>Logos, icons and flat illustrations; signatures and line art in black &amp; white mode.</li>
            <li>Outlines for cutting machines and laser engravers.</li>
            <li>
              Not photos or gradients: keep those raster and use the <Link href="/tools/image-compressor">image compressor</Link>.
            </li>
            <li>
              <Link href="/tools/image-cropper">Crop</Link> to the logo and use the sharpest copy you have; check the result
              with <Link href="/tools/svg-to-png">SVG to PNG</Link>.
            </li>
          </ul>

          <PrivacyNote>
            <p>Tracing runs in a background thread inside your browser, so your image is never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <PngToSvgTool />
    </ToolPageShell>
  );
}
