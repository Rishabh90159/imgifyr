import type { Metadata } from "next";
import Link from "next/link";
import { ImageCropperTool } from "@/components/tools/image-cropper-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("image-cropper");

const description =
  "Crop JPG, PNG, WebP and HEIC images online. Choose free crop or a ratio such as 1:1, 4:3 or 16:9, zoom, rotate and download the result. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "Image Cropper – Crop Photos Online Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Does cropping reduce image quality?",
    answer:
      "No. Cropping removes the pixels outside the selection and leaves the rest unchanged. PNG keeps them exactly; JPG and WebP re-compress them slightly at the quality you choose.",
  },
  {
    question: "How do I crop an image to a square?",
    answer:
      "Choose the 1:1 aspect ratio. The crop box becomes the largest square that fits and stays square as you move or resize it.",
  },
  {
    question: "Can I crop to an exact pixel size, like 1080 × 1080?",
    answer:
      "Choose 1:1, frame the crop, then turn on “Resize the cropped image” and enter 1080 as the width. For an unusual size, use Custom and enter the width and height as the ratio.",
  },
  {
    question: "Does it work on a phone?",
    answer:
      "Yes. Drag the box with one finger, drag a corner to resize, and pinch to zoom. On a computer you can also use the arrow keys, with Shift to resize.",
  },
  {
    question: "What's the difference between cropping and resizing?",
    answer:
      "Cropping cuts away part of the picture, changing what's shown and its shape. Resizing keeps the whole picture but changes its pixel count. Often you need both: crop first, then resize.",
  },
  {
    question: "Are my photos uploaded?",
    answer: "No. The crop is made by your browser on your device. Your photo is never sent to a server.",
  },
];

export default function ImageCropperPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Crop Image Online"
      intro={
        <p>
          Crop a photo freely or to a fixed ratio such as 1:1, 4:3 or 16:9, with zoom, rotate and mirror. Works with touch,
          mouse and keyboard, and nothing is uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to crop an image</h2>
          <ol>
            <li>Choose, drop or paste a JPG, PNG, WebP or iPhone HEIC image.</li>
            <li>Pick an aspect ratio, or keep Free to crop any shape.</li>
            <li>Drag the box and its corners to frame your subject; zoom in for detail.</li>
            <li>Rotate or mirror if needed, choose a format, select Crop image and download.</li>
          </ol>

          <h2>Aspect ratios for an image crop</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">Ratio</th>
                <th scope="col">Typical uses</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1:1</td>
                <td>Profile pictures, avatars, square social posts</td>
              </tr>
              <tr>
                <td>4:3 / 3:4</td>
                <td>Most phone photos, presentations</td>
              </tr>
              <tr>
                <td>3:2 / 2:3</td>
                <td>DSLR photos, 6 × 4 inch prints</td>
              </tr>
              <tr>
                <td>16:9 / 9:16</td>
                <td>Video thumbnails, banners; stories and reels</td>
              </tr>
            </tbody>
          </table>
          <p>
            Use <strong>Landscape</strong> or <strong>Portrait</strong> to flip a ratio, and <strong>Custom</strong> for
            anything else, such as 5:4.
          </p>

          <h2>Crop photo first, then resize</h2>
          <p>
            Cropping changes <em>what</em> is in the picture; <Link href="/tools/image-resizer">resizing</Link> changes{" "}
            <em>how many pixels</em> it has. Resizing to a new shape without cropping stretches the photo, so crop to the ratio
            first. This image cropper can do both in one step, and you can{" "}
            <Link href="/tools/image-compressor">compress the image</Link> afterwards if a site limits upload size.
          </p>

          <h2>Photos for official forms</h2>
          <p>
            The <Link href="/tools/passport-photo-resizer">passport photo resizer</Link> crops to a required size in pixels or
            millimetres, and the <Link href="/tools/signature-resizer">signature resizer</Link> cleans up and sizes a
            signature scan.
          </p>

          <PrivacyNote>
            <p>Cropping happens in your browser; the cropped file isn&apos;t uploaded and has no location or camera metadata.</p>
          </PrivacyNote>
        </>
      }
    >
      <ImageCropperTool />
    </ToolPageShell>
  );
}
