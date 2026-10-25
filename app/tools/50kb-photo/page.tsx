import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { TargetSizeTool } from "@/components/tools/target-size-tool";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("50kb-photo");

const description =
  "Make a photo under 50KB that still shows a clear face. Built for application forms: preset 50 KB target, honest results, optional width limit. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "Resize Image to 50KB Online – Free 50KB Image Compressor",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I make my photo less than 50KB?",
    answer:
      "Add the photo; the target is already 50 KB. Select Resize to 50 KB. The full size is kept if a good quality level fits; otherwise the dimensions shrink slightly so the face stays sharp.",
  },
  {
    question: "My form says “between 20 KB and 50 KB”. Will the result be above 20 KB?",
    answer:
      "In almost every case. The tool uses as much of the 50 KB as it can, so a normal photo lands around 40–50 KB. If a very plain image ends up below 20 KB, pick a larger, more detailed photo.",
  },
  {
    question: "Does reducing the dimensions reduce the file size?",
    answer:
      "Yes, strongly. Halving the width and height cuts the size to about a quarter, which is why a 12-megapixel phone photo can't stay full size at 50 KB without heavy blockiness.",
  },
  {
    question: "Why does my 50KB photo look blurry?",
    answer:
      "Usually the face is small in the frame, so most of the budget goes on background. Crop to head and shoulders, then resize. A blurry original stays blurry; reducing size can't add sharpness.",
  },
  {
    question: "The form needs 200 × 230 pixels and under 50 KB. What do I do?",
    answer:
      "Use the IBPS or SBI photo page: each crops to that shape, outputs exactly 200 × 230 pixels and keeps the file within 20–50 KB, as their current notifications specify.",
  },
  {
    question: "Is compressing an image to 50KB the same as resizing it to 50KB?",
    answer:
      "Here it is one job. JPG quality is lowered first, and pixel dimensions drop only if quality alone can't reach 50 KB at a good level. Our 12-megapixel test photo came down to about 991 × 743 pixels.",
  },
];

export default function FiftyKbPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Image to 50KB Online"
      intro={
        <p>
          A photo under 50KB is a common requirement on recruitment, exam and admission forms. Add your photo and the tool
          finds the best version under 50 KB, entirely in your browser.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to Resize an Image to 50KB</h2>
          <ol>
            <li>
              <Link href="/tools/image-cropper">Crop the photo</Link> to head and shoulders; a larger face stays clearer.
            </li>
            <li>Add it here. 50 KB is preselected, with quick picks of 30, 40, 75 and 100 KB.</li>
            <li>
              Select <strong>Resize to 50 KB</strong> and check the result size, the saving and any change in dimensions.
            </li>
            <li>Download the JPG and upload it to your form.</li>
          </ol>

          <h2>Compress a JPG or PNG to a 50KB Photo</h2>
          <p>
            At 50 KB the quality stays around 78% or higher and only large photos lose pixels. A PNG is converted to JPG,
            with any transparent background filled white. Results from our detailed, noisy test images:
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">Starting image</th>
                <th scope="col">Result under 50 KB</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>12-megapixel phone photo (4000 × 3000)</td>
                <td>about 991 × 743 px at 78% quality</td>
              </tr>
              <tr>
                <td>Portrait photo (1200 × 1600)</td>
                <td>about 677 × 902 px at 78% quality</td>
              </tr>
              <tr>
                <td>Signature scan (1400 × 700)</td>
                <td>kept at 1400 × 700 px, 86% quality</td>
              </tr>
            </tbody>
          </table>
          <p>
            Forms rarely need more than a few hundred pixels across, so a face is easily recognisable. To pick the quality
            yourself, use the <Link href="/tools/image-compressor">image compressor</Link>; for another limit,{" "}
            <Link href="/tools/resize-image-to-kb">resize image to KB</Link>.
          </p>

          <h2>Common problems with 50KB uploads</h2>
          <ul>
            <li>
              <strong>Form still rejects it:</strong> check it&apos;s a JPG with any required pixel size. Some portals count 1
              KB as 1,000 bytes, so set a custom 48 KB.
            </li>
            <li>
              <strong>Photo is sideways:</strong> the phone&apos;s rotation is applied, so the download is the right way up.
            </li>
            <li>
              <strong>Face looks soft:</strong> shoot in daylight against a plain light wall; noise and patterns cost bytes.
            </li>
            <li>
              <strong>&ldquo;Closest achievable size&rdquo;:</strong> dimension changes are off; turn them on, or crop first.
            </li>
          </ul>

          <h2>50KB photo rules on exam forms</h2>
          <p>
            Current IBPS Common Recruitment Process notifications and SBI recruitment advertisements ask for a photo of 20–50
            KB at 200 × 230 pixels (preferred). The <Link href="/tools/ibps-photo">IBPS photo resizer</Link> and{" "}
            <Link href="/tools/sbi-photo">SBI photo resizer</Link> apply those values and cite the notification. For a
            signature, use the <Link href="/tools/20kb-photo">20KB photo resizer</Link>; with more room, the{" "}
            <Link href="/tools/100kb-photo">100KB photo resizer</Link> keeps more detail, and the{" "}
            <Link href="/tools/200kb-photo">200KB photo resizer</Link> suits forms that accept up to 200 KB.
          </p>

          <PrivacyNote>
            <p>Your photo is compressed by your own browser and is never uploaded, stored or seen by anyone else.</p>
          </PrivacyNote>
        </>
      }
    >
      <TargetSizeTool
        tool="50kb-photo"
        defaultTargetKB={50}
        presetsKB={[30, 40, 50, 75, 100]}
        events={{ started: "kb_photo_started", completed: "kb_photo_completed", downloaded: "photo_downloaded" }}
      />
    </ToolPageShell>
  );
}
