import type { Metadata } from "next";
import Link from "next/link";
import { InstagramResizerTool } from "@/components/tools/instagram-resizer-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { INSTAGRAM_PRESETS } from "@/lib/presets/instagram";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("instagram-image-resizer");

const description =
  "Resize images for Instagram posts, Stories and Reels for free. Choose the right dimensions, crop or fit your image, preview the result and download it.";

export const metadata: Metadata = pageMetadata({
  title: "Instagram Image Resizer Online Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I resize an image for Instagram?",
    answer:
      "Add your photo, pick the format you're posting, then drag the crop box or switch to Fit to keep the whole photo. Select Create Instagram image, check the preview and download.",
  },
  {
    question: "What is the best size for an Instagram post?",
    answer:
      "A 1080 × 1350 px portrait (4:5) suits most photos because it fills more of the feed. Use 1080 × 1080 px for square pictures or a uniform grid, and 1080 × 566 px for wide landscapes.",
  },
  {
    question: "What size should an Instagram Story be?",
    answer:
      "1080 × 1920 pixels, a 9:16 vertical frame. Your profile name and the reply bar cover the top and bottom, so the Story preset shows a guide for keeping text and faces in the middle.",
  },
  {
    question: "What dimensions should I use for a Reel cover?",
    answer:
      "1080 × 1920 pixels, matching the 9:16 Reel. The profile grid shows only a cropped middle part, currently 3:4, so keep the title and subject inside the preset's guide.",
  },
  {
    question: "Can I resize an Instagram image without cropping it?",
    answer:
      "Yes. Choose Fit whole photo: the picture is scaled into the frame and the space around it is filled with white, black, a colour you choose or a blurred copy of the photo.",
  },
  {
    question: "Is this Instagram image resizer free?",
    answer:
      "Yes. There is no account, no limit on how many images you resize and no watermark. Everything happens in your browser, so your photo is never uploaded.",
  },
];

export default function InstagramImageResizerPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Instagram Image Resizer"
      intro={
        <p>
          Crop or fit photos to the exact size for Instagram posts, Stories and Reel covers. Preview the result and download
          it, all made in your browser.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to resize an image for Instagram</h2>
          <ol>
            <li>Add a JPG, PNG, WebP or iPhone HEIC photo.</li>
            <li>Pick a feed post shape, a Story or a Reel cover; each shows its pixel size and ratio.</li>
            <li>
              Use <strong>Crop to fill</strong> and drag the frame, or <strong>Fit whole photo</strong> to keep everything.
            </li>
            <li>
              Choose the format and quality, select <strong>Create Instagram image</strong>, and download.
            </li>
          </ol>

          <h2>Instagram image size reference</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">Format</th>
                <th scope="col">Size in pixels</th>
                <th scope="col">Aspect ratio</th>
                <th scope="col">Good for</th>
              </tr>
            </thead>
            <tbody>
              {INSTAGRAM_PRESETS.map((preset) => (
                <tr key={preset.id}>
                  <td>{preset.label}</td>
                  <td>
                    {preset.width} × {preset.height}
                  </td>
                  <td>{preset.ratio}</td>
                  <td>{preset.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            A <strong>4:5 portrait</strong> is usually the best feed pick, as it takes up the most room while scrolling. The{" "}
            <strong>3:4</strong> preset matches taller profile-grid previews, but some apps still trim it to 4:5, so check it
            after posting. Stories
            and Reels use a full-screen 9:16 frame where buttons and captions sit on top, so turn on the guide. Feed images
            wider than 1080 pixels are scaled down when posted, so larger uploads gain little.
          </p>

          <h2>Crop or fit: which should you use?</h2>
          <p>
            <strong>Cropping</strong> fills the frame and cuts off the rest; drag, pinch or use the arrow keys to choose what
            stays. <strong>Fitting</strong> keeps every pixel and fills the empty space with white, black, a colour or a
            blurred copy, ideal for panoramas, screenshots and group shots. Neither mode stretches the image.
          </p>

          <h2>Tips and other tools</h2>
          <ul>
            <li>Start from the original photo; copies saved from messaging apps are often reduced.</li>
            <li>
              Need a lighter file? The <Link href="/tools/image-compressor">image compressor</Link> keeps the dimensions.
            </li>
            <li>
              Other sizes: the <Link href="/tools/image-resizer">image resizer</Link> or the{" "}
              <Link href="/tools/image-cropper">image cropper</Link> for ratios like 16:9.
            </li>
            <li>
              Convert first if you prefer: <Link href="/tools/heic-to-jpg">HEIC to JPG</Link> or{" "}
              <Link href="/tools/webp-to-jpg">WebP to JPG</Link>.
            </li>
          </ul>

          <PrivacyNote>
            <p>Your photo is cropped or fitted and saved by your own browser, and never uploaded or stored.</p>
          </PrivacyNote>
        </>
      }
    >
      <InstagramResizerTool />
    </ToolPageShell>
  );
}
