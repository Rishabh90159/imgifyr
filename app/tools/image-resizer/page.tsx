import type { Metadata } from "next";
import Link from "next/link";
import { ImageResizerTool } from "@/components/tools/image-resizer-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("image-resizer");

const description =
  "Free online image resizer for JPG, PNG, WebP and HEIC photos. Resize by pixels or percentage, keep the aspect ratio, pick a popular size and download. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "Image Resizer – Resize Images Online by Pixels or Percentage",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I resize an image without losing quality?",
    answer:
      "Make the image smaller rather than larger, keep the aspect ratio locked, and save as PNG or as JPG or WebP at 90% quality or higher. Large reductions are scaled in several smooth steps, so edges stay clean.",
  },
  {
    question: "Does resizing an image reduce its file size?",
    answer:
      "Usually, yes. Halving the width and height typically cuts the file to roughly a quarter. To meet a limit such as 100 KB, the Resize Image to KB tool adjusts quality and dimensions for you.",
  },
  {
    question: "Should I resize by pixels or by percentage?",
    answer:
      "Use pixels when you've been given a number, such as 1200 px wide or 600 × 600. Use percentage to scale by a fixed amount, such as 50%, without working out the new numbers yourself.",
  },
  {
    question: "Can I make an image bigger?",
    answer:
      "Yes, up to 16,384 pixels per side. Enlarging can't create detail that wasn't captured, so the result looks softer; start from the highest-resolution original you have.",
  },
  {
    question: "Is there a maximum image size?",
    answer:
      "Files can be up to 50 MB and 100 megapixels, and output up to 16,384 pixels per side and 50 megapixels in total. Very large images may need a desktop browser rather than a phone.",
  },
  {
    question: "Are my images uploaded to a server?",
    answer:
      "No. The image is read and resized by your own browser, the result is created on your device, and nothing is kept after you close the tab.",
  },
];

export default function ImageResizerPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Image Resizer – Resize Images & Photos Online"
      intro={
        <p>
          Resize a JPG, PNG, WebP or iPhone HEIC photo by pixels or percentage and keep its proportions. This online image
          resizer runs in your browser, so your image is never uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to Resize an Image Online</h2>
          <ol>
            <li>Choose, drop or paste a JPG, PNG, WebP or HEIC image.</li>
            <li>
              Enter a width or height in pixels, pick a popular size, or switch to <strong>Percentage</strong>.
            </li>
            <li>Keep the original format or pick JPG, PNG or WebP, with a quality setting for JPG and WebP.</li>
            <li>
              Select <strong>Resize image</strong>, compare the before and after sizes, then download.
            </li>
          </ol>

          <h2>Resize an Image by Pixels or by Percentage</h2>
          <p>
            Use <strong>Pixels</strong> when you have been given a number: 1200 px wide for a website, 400 × 400 for a
            profile photo. Type one side and the other follows, so the picture keeps its shape. Use{" "}
            <strong>Percentage</strong> to scale by a fixed amount: 50% halves both sides, 200% doubles them.
          </p>

          <h2>Popular Image Dimensions</h2>
          <p>
            The <strong>Popular dimensions</strong> menu fits the image inside a common size without stretching it. To fill
            the exact shape, <Link href="/tools/image-cropper">crop the image to the same ratio</Link> first, or use the{" "}
            <Link href="/tools/instagram-image-resizer">Instagram image resizer</Link> for posts, Stories and Reel covers.
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">Size</th>
                <th scope="col">Pixels</th>
                <th scope="col">Typical use</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>HD / Full HD / 4K</td>
                <td>1280 × 720 / 1920 × 1080 / 3840 × 2160</td>
                <td>Wallpapers, slides, video thumbnails, website banners</td>
              </tr>
              <tr>
                <td>Square post</td>
                <td>1080 × 1080</td>
                <td>Social media feeds, marketplace listings</td>
              </tr>
              <tr>
                <td>Portrait post (4:5)</td>
                <td>1080 × 1350</td>
                <td>Taller feed posts that fill more of a phone screen</td>
              </tr>
              <tr>
                <td>Vertical story (9:16)</td>
                <td>1080 × 1920</td>
                <td>Stories, reels and status updates</td>
              </tr>
              <tr>
                <td>Link preview</td>
                <td>1200 × 630</td>
                <td>The image shown when a web page is shared</td>
              </tr>
            </tbody>
          </table>

          <h2>Resize JPG, PNG, WebP, HEIC and GIF Images</h2>
          <p>
            A JPG stays a JPG unless you pick another format, PNGs keep their transparency, and iPhone HEIC photos are saved
            as JPG. Each format also has its own page: the <Link href="/tools/resize-jpg">JPG resizer</Link> sets a print
            DPI, the <Link href="/tools/resize-png">PNG resizer</Link> reduces colours, the{" "}
            <Link href="/tools/resize-webp">WebP resizer</Link> flags animated files, and the{" "}
            <Link href="/tools/resize-gif">GIF resizer</Link> resizes every frame of an animation.
          </p>

          <h2>Photo Size Reducer: Resize Image Without Losing Quality</h2>
          <p>
            A 12-megapixel phone picture is around 4000 pixels wide and several megabytes. Bringing it down to 1280 or 1600
            pixels makes it a fraction of the size and still sharp on screens. This photo resizer reduces large images in
            several halving steps with high-quality smoothing, so edges don&apos;t turn jagged.
          </p>
          <ul>
            <li>
              Limit in KB? Use <Link href="/tools/resize-image-to-kb">resize image to KB</Link>, or the{" "}
              <Link href="/tools/50kb-photo">50KB</Link> and <Link href="/tools/100kb-photo">100KB</Link> photo pages.
            </li>
            <li>
              Exam or ID photo? The <Link href="/tools/passport-photo-resizer">passport photo resizer</Link> sets pixels and
              KB together.
            </li>
            <li>
              Still too heavy after the photo resize? <Link href="/tools/image-compressor">Compress the image</Link>.
            </li>
            <li>
              A whole folder? The <Link href="/tools/bulk-image-resizer">bulk image resizer</Link> handles them in one go.
            </li>
          </ul>

          <PrivacyNote>
            <p>Your image is decoded and redrawn at the new size on your device, and is never uploaded or stored.</p>
          </PrivacyNote>
        </>
      }
    >
      <ImageResizerTool />
    </ToolPageShell>
  );
}
