import type { Metadata } from "next";
import Link from "next/link";
import { FormatConverterTool, type ConverterConfig } from "@/components/tools/format-converter-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("heic-to-jpg");

const description =
  "Convert HEIC and HEIF photos from your iPhone to JPG online. Adjust quality, preview the result and download a JPG that opens anywhere. No upload.";

export const metadata: Metadata = pageMetadata({
  title: "HEIC to JPG Converter – Convert HEIC Images to JPG Online",
  description,
  path: tool.path,
});

const config: ConverterConfig = {
  tool: "heic-to-jpg",
  from: ["image/heic"],
  to: "image/jpeg",
  completedEvent: "heic_conversion_completed",
};

const faqs: FaqItem[] = [
  {
    question: "Why are my iPhone photos HEIC files?",
    answer:
      "Since iOS 11, iPhones save photos as HEIC when the camera format is set to “High Efficiency”. That roughly halves the storage per photo, but many websites, Windows apps and upload forms still expect JPG.",
  },
  {
    question: "Does converting HEIC to JPG improve or reduce quality?",
    answer:
      "It can't improve it. Re-encoding adds a little compression loss that is hard to see at the default 90% quality, and the JPG is usually larger than the HEIC because JPG compresses less efficiently.",
  },
  {
    question: "Is HEIF the same as HEIC?",
    answer:
      "HEIF is the container format; HEIC is HEIF holding HEVC-compressed images, which is what iPhones produce. This converter accepts both .heic and .heif files.",
  },
  {
    question: "Are my photos uploaded to convert them?",
    answer:
      "No. The HEIC decoder (about 2 MB) is downloaded to your browser once and runs on your device. Safari can read HEIC natively, so there it isn't needed at all.",
  },
  {
    question: "Is the photo's location and camera data kept?",
    answer:
      "No. The JPG contains only the image pixels, so EXIF details such as GPS location, date and camera model are left out. Keep the original iPhone photo if you need them.",
  },
  {
    question: "How do I stop my iPhone taking HEIC photos?",
    answer:
      "Go to Settings > Camera > Formats and choose “Most Compatible”. New photos will be saved as JPG; existing ones stay HEIC, so convert those here when needed.",
  },
];

export default function HeicToJpgPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="HEIC to JPG Converter"
      intro={
        <p>
          Turn iPhone HEIC and HEIF photos into JPGs that open on Windows, websites and upload forms. Conversion happens in
          your browser, so your photos are never uploaded.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to convert HEIC to JPG</h2>
          <ol>
            <li>Choose or drop a .heic or .heif photo. The first time, the HEIC decoder loads in your browser.</li>
            <li>It&apos;s converted to JPG at 90% quality and shown side by side with the original.</li>
            <li>Lower the quality for a smaller file if you like, then download the JPG.</li>
          </ol>

          <h2>HEIC vs JPG</h2>
          <table>
            <thead>
              <tr>
                <th scope="col"> </th>
                <th scope="col">HEIC</th>
                <th scope="col">JPG</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">File size</th>
                <td>About half, at the same quality</td>
                <td>Larger</td>
              </tr>
              <tr>
                <th scope="row">Compatibility</th>
                <td>Apple devices, recent systems with add-ons</td>
                <td>Almost everything</td>
              </tr>
              <tr>
                <th scope="row">Best for</th>
                <td>Storing photos on Apple devices</td>
                <td>Sharing, uploading, printing</td>
              </tr>
            </tbody>
          </table>
          <p>
            Both formats are lossy, so converting re-compresses the photo once. At 85–92% quality the difference is very hard
            to see, and the JPG won&apos;t look any better than the HEIC did.
          </p>

          <h2>Making the JPG smaller</h2>
          <p>
            iPhone photos are often 3–8 MB as JPG. For a form with a limit, <Link href="/tools/image-compressor">compress the JPG</Link>,{" "}
            <Link href="/tools/image-resizer">resize it</Link> or use{" "}
            <Link href="/tools/resize-image-to-kb">resize an image to a target size in KB</Link>. Converting a whole camera
            roll? The <Link href="/tools/bulk-image-resizer">bulk image resizer</Link> also accepts HEIC and saves JPGs.
          </p>

          <PrivacyNote>
            <p>The HEIC decoder runs inside your browser, so neither your photo nor its location data is uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <FormatConverterTool config={config} />
    </ToolPageShell>
  );
}
