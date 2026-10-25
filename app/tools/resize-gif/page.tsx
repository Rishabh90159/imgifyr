import type { Metadata } from "next";
import Link from "next/link";
import { GifResizerTool } from "@/components/tools/gif-resizer-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("resize-gif");

const description =
  "Resize animated GIFs online and keep every frame, the timing and the loop. Scale by pixels or percentage, smooth or pixel-sharp, then download. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "Resize GIF Online – Resize Animated GIFs, Keep Animation",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Will my GIF still be animated after resizing?",
    answer:
      "Yes. Every frame is decoded, resized and written into a new animated GIF with the original delays and loop setting. Frames that end up identical are merged, which plays the same and saves space.",
  },
  {
    question: "Why do other image tools turn my GIF into a still picture?",
    answer:
      "Browsers hand web pages only the first frame when a GIF is drawn to a canvas. This tool reads the GIF file itself, frame by frame, and writes a new GIF with its own encoder.",
  },
  {
    question: "Should I choose Smooth or Sharp pixels?",
    answer:
      "Smooth blends pixels and suits GIFs made from videos or photos. Sharp pixels copies the nearest original pixel, keeping the hard edges of pixel art and emoji; it looks best at steps such as 50% or 200%.",
  },
  {
    question: "How do I make a GIF file smaller?",
    answer:
      "Shrink the dimensions: half the width and height leaves a quarter of the pixels in every frame. 480 pixels wide or less is a common choice for chat apps and forums.",
  },
  {
    question: "Does the resized GIF keep transparency?",
    answer:
      "Yes. GIF transparency is on or off per pixel, so soft edges become fully transparent or fully visible, and transparent areas stay transparent in every frame.",
  },
  {
    question: "Are there any limits?",
    answer:
      "GIFs up to 50 MB and 1,000 frames, with output up to 4,096 pixels per side. Long or large animations need more memory, so a desktop browser copes better than a phone.",
  },
];

export default function ResizeGifPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Animated GIFs Online"
      intro={
        <p>
          Resize GIF online without losing the animation: every frame is scaled and the timing and loop stay the same. This
          GIF resizer runs on your device, so nothing is uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to resize a GIF</h2>
          <ol>
            <li>Choose, drop or paste a .gif file; its frame count and play time are shown.</li>
            <li>
              Enter a new width or height, choose a common GIF width, or switch to <strong>Percentage</strong>.
            </li>
            <li>
              Pick <strong>Smooth</strong> for video clips and photos, or <strong>Sharp pixels</strong> for pixel art and
              icons.
            </li>
            <li>
              Select <strong>Resize GIF</strong>, watch the preview play, and download.
            </li>
          </ol>

          <h2>How to resize animated GIF files and keep the motion</h2>
          <p>
            Each GIF frame may cover only part of the picture and depend on earlier ones. The resizer rebuilds every full
            frame as a browser shows it, scales it, picks the best 256 colours for it and writes it with the original delay.
            Frame count, loop setting and transparency are kept, and unchanged areas are stored as transparent so the file
            stays compact.
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">Mode</th>
                <th scope="col">What it does</th>
                <th scope="col">Use it for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Smooth</td>
                <td>Lanczos resampling for a natural look, then a new palette per frame</td>
                <td>Screen recordings, video clips, photographic GIFs</td>
              </tr>
              <tr>
                <td>Sharp pixels</td>
                <td>Nearest-neighbour scaling with the exact original colours</td>
                <td>Pixel art, emoji, game sprites, animated icons</td>
              </tr>
            </tbody>
          </table>

          <h2>Making a GIF smaller in KB</h2>
          <p>
            GIF compression is lossless within its 256-colour limit, so dimensions drive the file size: a GIF resize from
            1000 to 500 pixels wide typically cuts it to around a quarter. If a site limits uploads, try 480 or 320 pixels.
            For a still image, PNG or JPG is far smaller; use the <Link href="/tools/resize-png">PNG resizer</Link> or the{" "}
            <Link href="/tools/image-resizer">image resizer</Link> instead.
          </p>

          <h2>Supported files and limits</h2>
          <p>
            Animated and still GIF87a and GIF89a files, interlaced or not, up to 50 MB and 1,000 frames. Each side of the
            resized GIF can be up to 4,096 pixels. Animated WebP and APNG files aren&apos;t supported yet. To combine several
            pictures into one image, use <Link href="/tools/merge-images">merge images</Link>.
          </p>

          <PrivacyNote>
            <p>The GIF is decoded and re-encoded in a background worker in your browser, and no frame is uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <GifResizerTool />
    </ToolPageShell>
  );
}
