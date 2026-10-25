import type { Metadata } from "next";
import Link from "next/link";
import { ImageResizerTool } from "@/components/tools/image-resizer-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("resize-jpg");

const description =
  "Resize JPG and JPEG photos to exact pixels or a percentage, choose the JPG quality and an optional print DPI, then download. Free, and done in your browser.";

export const metadata: Metadata = pageMetadata({
  title: "Resize JPG Online – Change JPG Image Dimensions Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Does resizing a JPG reduce its quality?",
    answer:
      "Each save compresses a JPG again, so a little detail is always lost. At 90% quality the difference is very hard to see. Avoid resizing the same JPG repeatedly; go back to the original each time.",
  },
  {
    question: "What JPG quality should I choose?",
    answer:
      "90% suits most photos, and 80–85% is fine for web pages and email. Use 95% or more only if the photo will be edited or printed again. Below about 60%, blocky artefacts appear around edges and in skies.",
  },
  {
    question: "What does the DPI setting change?",
    answer:
      "Only the print size recorded in the file. A 3000 × 2000 pixel JPG prints at 10 × 6.67 inches at 300 DPI, or 20 × 13.3 inches at 150 DPI. Pixels, sharpness and file size stay the same.",
  },
  {
    question: "Is JPEG different from JPG?",
    answer:
      "No, they are two names for the same format, and both open here. The download always uses the .jpg extension; to rename .jpeg or .jfif files without resizing, use the JPEG to JPG converter.",
  },
  {
    question: "My JPG comes out sideways on other sites. Will this fix it?",
    answer:
      "Yes. Phones often store photos sideways with a rotation tag that some websites ignore. The tag is applied to the pixels before the JPG resize, so the new file is the right way up everywhere.",
  },
  {
    question: "Can I resize a JPG to a file size such as 100 KB?",
    answer:
      "This page sets dimensions. When a form gives a limit in KB, use Resize Image to KB, which finds a quality and size that fit, or the ready-made 50 KB and 100 KB pages.",
  },
];

export default function ResizeJpgPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize JPG Images Online"
      intro={
        <p>
          Resize JPG online by pixels or percentage, set the JPG quality and, for printing, a DPI. This JPG resizer works on
          your device and saves a .jpg that opens anywhere.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to resize a JPG</h2>
          <ol>
            <li>Open a .jpg or .jpeg photo by choosing, dropping or pasting it.</li>
            <li>Type a width or height, tap a common width, or enter a percentage such as 50%.</li>
            <li>Leave quality at 90% unless you need a much lighter file; for printing, pick 150 or 300 DPI.</li>
            <li>
              Select <strong>Resize JPG</strong>, check the new KB size, and download.
            </li>
          </ol>

          <h2>JPG quality and file size after resizing</h2>
          <p>
            Pixels matter most: halving the width and height leaves a quarter of the pixels, and the file typically ends up
            around a quarter of its old size. Quality then fine-tunes it; dropping from 95% to 85% often saves another third
            with no visible change. Phone photos are usually 3000–4000 pixels wide and 2–6 MB; for a web page or a message,
            1280 to 1920 pixels at 80–90% is plenty. To hit a KB number,
            the <Link href="/tools/resize-image-to-kb">resize image to KB tool</Link> works out both settings, and the{" "}
            <Link href="/tools/image-compressor">JPG compressor</Link> shrinks a photo without touching its dimensions.
          </p>

          <h2>Setting DPI for printing</h2>
          <p>
            DPI is only a label telling a printer how large to print the pixels, so a JPG at 72 DPI and at 300 DPI look
            identical on screen. A sharp print needs enough pixels at around 300 DPI:
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">Print size</th>
                <th scope="col">Pixels needed at 300 DPI</th>
                <th scope="col">At 150 DPI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Passport photo, 35 × 45 mm</td>
                <td>413 × 531</td>
                <td>207 × 266</td>
              </tr>
              <tr>
                <td>6 × 4 in photo print</td>
                <td>1800 × 1200</td>
                <td>900 × 600</td>
              </tr>
              <tr>
                <td>A4 page, 210 × 297 mm</td>
                <td>2480 × 3508</td>
                <td>1240 × 1754</td>
              </tr>
            </tbody>
          </table>
          <p>
            Passport and visa photos also have head-size and background rules; the{" "}
            <Link href="/tools/passport-photo-resizer">passport photo resizer</Link> handles those in millimetres.
          </p>

          <h2>Supported files</h2>
          <p>
            This page opens .jpg and .jpeg files up to 50 MB and 100 megapixels, and always saves a .jpg with the phone&apos;s
            rotation applied and camera details and GPS location removed. For a PNG, WebP or
            iPhone HEIC photo, use the <Link href="/tools/image-resizer">image resizer</Link>, the{" "}
            <Link href="/tools/resize-png">PNG resizer</Link> (keeps transparency) or the{" "}
            <Link href="/tools/resize-webp">WebP resizer</Link> (can keep a WebP as WebP). For a folder of photos, the{" "}
            <Link href="/tools/bulk-image-resizer">bulk image resizer</Link> gives you a ZIP.
          </p>

          <PrivacyNote>
            <p>Your JPG is decoded, scaled and re-encoded by your browser, and the photo is never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <ImageResizerTool variant="jpg" />
    </ToolPageShell>
  );
}
