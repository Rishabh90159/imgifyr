import type { Metadata } from "next";
import Link from "next/link";
import { DpiTool } from "@/components/tools/dpi-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("change-image-dpi");

const description =
  "Change DPI of image online: check a JPG or PNG's current DPI and set it to 300, 200, 600 or any value without changing pixels or quality. Free DPI converter, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Change DPI of Image Online – 300 DPI Converter & Checker",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I change an image to 300 DPI?",
    answer:
      "Drop the image, choose 300 and select Change to 300 DPI. A JPG or PNG keeps every pixel; only the resolution stored in the file changes, so it prints smaller and sharper.",
  },
  {
    question: "Does changing DPI reduce quality?",
    answer:
      "Not here. For JPG and PNG the image data is copied unchanged and only the header is edited. WebP and HEIC can't store DPI, so they're saved as a high-quality JPG at the same size.",
  },
  {
    question: "How do I check the DPI of an image?",
    answer:
      "Drop it in: the current DPI and where it's stored are shown straight away, with the printed size it gives. Phone photos usually say 72 DPI, which only matters when printing.",
  },
  {
    question: "Why does my form ask for 200 or 300 DPI?",
    answer:
      "It wants the picture to print at a set physical size. If it also gives centimetres, resize to that size in cm at the same DPI instead of only changing the value.",
  },
  {
    question: "Will Windows show the new DPI?",
    answer:
      "Yes. Phone photos keep DPI in EXIF, which Windows reads first, so the tool updates EXIF as well as the JFIF header. Right-click › Properties › Details shows the new value.",
  },
];

export default function ChangeImageDpiPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Change DPI of Image (DPI Converter)"
      intro={
        <p>
          Check what DPI a JPG or PNG is set to and change it to 300, 200 or any value. Pixels and quality stay exactly as they
          were.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>What DPI means for a digital photo</h2>
          <p>
            DPI (dots per inch) is a number stored in the file that tells printers how big to print it. A 1200 × 1800 pixel
            photo prints at 10.2 × 15.2 cm at 300 DPI, or 42.3 × 63.5 cm at 72 DPI. On screen, and to most upload forms, the
            pixels are what count.
          </p>

          <h2>Change DPI to 300, 200 or 600 without resampling</h2>
          <p>
            This DPI converter edits only the resolution fields: the JFIF header and EXIF in a JPG, or the pHYs chunk in a PNG.
            The download has the same pixels, so you can switch back at any time. For a set size in centimetres, use{" "}
            <Link href="/tools/resize-image-in-cm">resize image in cm</Link>; for a 300 DPI JPG of a PDF page, use{" "}
            <Link href="/tools/pdf-to-jpg">PDF to JPG</Link>.
          </p>

          <h2>When more pixels are needed</h2>
          <p>
            Raising DPI on a small image makes the print smaller, not sharper. To print large at 300 DPI you need more pixels:
            enlarge with the <Link href="/tools/image-upscaler">image upscaler</Link>, then set the DPI here.
          </p>

          <PrivacyNote>
            <p>The file is read and rewritten in your browser; it is never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <DpiTool />
    </ToolPageShell>
  );
}
