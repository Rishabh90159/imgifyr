import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { TargetSizeTool } from "@/components/tools/target-size-tool";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("200kb-photo");

const description =
  "Compress a large photo to 200KB while keeping high resolution. Preset 200 KB target, optional width cap, exact result size shown. Free, in your browser.";

export const metadata: Metadata = pageMetadata({
  title: "Resize Image to 200KB Online – Free 200KB Image Compressor",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I compress a photo to 200KB?",
    answer:
      "Add the photo; 200 KB is already selected. Select Resize to 200 KB. With this much room many photos keep their full dimensions and only quality is adjusted, while large phone photos drop to a still-sharp resolution.",
  },
  {
    question: "Why is my photo a few KB under 200KB?",
    answer:
      "The tool picks the highest quality that keeps the file at or below 200 KB. Quality moves in steps, so the result usually lands just under, such as 196 KB, and that is the size you download.",
  },
  {
    question: "Will a 12MP photo still look good at 200KB?",
    answer:
      "Yes, for screens. A detailed 4000 × 3000 test photo fitted at about 1670 × 1250 pixels with 78% quality, larger than most laptop displays. For large prints, keep the original.",
  },
  {
    question: "Does reducing dimensions help reach 200KB?",
    answer:
      "Yes. Size scales with pixel count, so a slightly smaller image saves a lot. Unless your form fixes the pixel size, leave “Allow smaller dimensions” on to balance size and quality.",
  },
  {
    question: "My photo is already smaller than 200KB. What happens?",
    answer:
      "A JPG under 200 KB is returned unchanged; PNG or WebP is converted to JPG. If the form also sets a minimum, such as 100–200 KB, and your photo is below it, use the Image Size Increase tool instead.",
  },
  {
    question: "What format works best at 200KB?",
    answer:
      "JPG for photos: it's widely accepted and efficient. WebP is slightly smaller at the same quality, but check that the site you're uploading to accepts it.",
  },
];

export default function TwoHundredKbPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Image to 200KB Online"
      intro={
        <p>
          200 KB leaves room for a detailed, high-resolution photo for portals with larger limits, listings and email. Add a
          photo and get the sharpest 200KB photo, with the real file size shown.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to Resize an Image to 200KB</h2>
          <ol>
            <li>Add your photo. JPG, PNG and WebP are supported; 200 KB is preselected.</li>
            <li>
              If the site lists a maximum width, such as 1920 px, set it under <strong>More options</strong>.
            </li>
            <li>Select <strong>Resize to 200 KB</strong>.</li>
            <li>Check the dimensions and quality in the comparison, then download.</li>
          </ol>

          <h2>Compress a JPG or PNG to 200KB</h2>
          <p>
            At 200 KB the tool rarely compromises much: quality usually stays around 70–90%, with the full size or a large
            share of it. From our deliberately detailed test images:
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">Starting image</th>
                <th scope="col">Result under 200 KB</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>12-megapixel photo (4000 × 3000)</td>
                <td>about 1672 × 1254 px at 78% quality</td>
              </tr>
              <tr>
                <td>Portrait photo (1200 × 1600)</td>
                <td>full 1200 × 1600 px at 68% quality</td>
              </tr>
              <tr>
                <td>Screenshot (1280 × 800)</td>
                <td>full size at 92% quality, well under 200 KB</td>
              </tr>
            </tbody>
          </table>
          <p>
            A JPG already under the limit is returned exactly as it is, with no pointless re-save. Large PNG exports are saved
            as JPG with transparency filled white; if it must stay a PNG, the{" "}
            <Link href="/tools/image-compressor">image compressor</Link> shrinks it with a colour palette, though not to an
            exact size.
          </p>

          <h2>Where a 200KB limit applies</h2>
          <ul>
            <li>
              <strong>Generous application portals:</strong> the NEET (UG) 2026 bulletin allows a 10–200 KB photograph; the{" "}
              <Link href="/tools/neet-photo">NEET photo resizer</Link> applies it and lists the source.
            </li>
            <li>
              <strong>Listings, email and albums:</strong> the <Link href="/tools/bulk-image-resizer">bulk image resizer</Link>{" "}
              handles many photos, then fine-tune any still over 200 KB here.
            </li>
            <li>
              <strong>Exact pixels matter more?</strong> Start with the <Link href="/tools/image-resizer">image resizer</Link>.
            </li>
            <li>
              <strong>Tighter limit?</strong> Use the <Link href="/tools/100kb-photo">100KB</Link> or{" "}
              <Link href="/tools/50kb-photo">50KB photo resizer</Link>, or{" "}
              <Link href="/tools/resize-image-to-kb">resize image to an exact KB size</Link> for 150 KB or 1 MB.
            </li>
          </ul>

          <h2>When the form sets a minimum size too</h2>
          <p>
            Some forms give a range, such as &ldquo;photo size 100–200 KB&rdquo;, and reject a file that is too small just
            like one that is too big. Compressing only makes it smaller, so{" "}
            <Link href="/tools/image-size-increase">increase the image size in KB</Link> instead: the file grows without
            changing how the photo looks.
          </p>

          <PrivacyNote>
            <p>Decoding, resizing and every compression attempt happen locally, so large personal photos never leave your device.</p>
          </PrivacyNote>
        </>
      }
    >
      <TargetSizeTool
        tool="200kb-photo"
        defaultTargetKB={200}
        presetsKB={[100, 150, 200, 300, 500]}
        events={{ started: "kb_photo_started", completed: "kb_photo_completed", downloaded: "photo_downloaded" }}
      />
    </ToolPageShell>
  );
}
