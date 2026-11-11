import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { TargetSizeTool } from "@/components/tools/target-size-tool";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("500kb-photo");

const description =
  "Compress an image to 500KB or less while keeping it sharp: photos, scans and certificates for job portals and uploads. Exact size shown, nothing uploaded.";

export const metadata: Metadata = pageMetadata({
  title: "Compress Image to 500KB – Reduce Photo Size Under 500 KB",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I compress an image to 500KB?",
    answer:
      "Add the image; the target is 500 KB. Most phone photos fit by lowering JPG quality slightly, so the full resolution is often kept. The final size is shown before download.",
  },
  {
    question: "Will my photo lose quality at 500KB?",
    answer:
      "Hardly. 500 KB holds a sharp photo of about 2000 pixels or more on the long side; differences from the original are rarely visible.",
  },
  {
    question: "Can I compress a scanned document to 500KB?",
    answer: "Yes, if it's an image (JPG or PNG). Text stays readable. For a PDF file, use the PDF compressor instead.",
  },
  {
    question: "Is 500KB the same as 0.5 MB?",
    answer:
      "Almost. This tool counts 1 MB as 1,024 KB, so 500 KB is about 0.49 MB. If a site says 0.5 MB, a 500 KB file fits.",
  },
  {
    question: "Is my file uploaded?",
    answer: "No. The image is compressed inside your browser and stays on your device.",
  },
];

export default function FiveHundredKbPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Compress Image to 500KB"
      intro={
        <p>
          Bring a 3–8 MB phone photo or scan under 500 KB for a job portal, email or upload form, while keeping it sharp. The
          exact size is shown before you download.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to reduce a photo to under 500KB</h2>
          <ol>
            <li>Add the photo, scan or certificate image; 500 KB is already selected.</li>
            <li>Leave smaller dimensions allowed unless the site fixes a pixel size.</li>
            <li>Check the preview for readable text or a sharp face, then download.</li>
          </ol>

          <h2>Photos, scans and PDFs</h2>
          <p>
            At 500 KB a photo usually keeps most of its resolution, so this limit is about trimming file size, not shrinking
            the picture. Document scans stay readable. A PDF needs the <Link href="/tools/compress-pdf">PDF compressor</Link>;
            to turn images into one PDF, use <Link href="/tools/photo-to-pdf">photo to PDF</Link>. Smaller limits have the{" "}
            <Link href="/tools/200kb-photo">200KB</Link> and <Link href="/tools/100kb-photo">100KB</Link> pages.
          </p>

          <PrivacyNote>
            <p>Your photo or document is compressed in your browser; nothing is uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <TargetSizeTool
        tool="500kb-photo"
        defaultTargetKB={500}
        quickStart
        presetsKB={[200, 300, 400, 500, 750]}
        events={{ started: "kb_photo_started", completed: "kb_photo_completed", downloaded: "photo_downloaded" }}
      />
    </ToolPageShell>
  );
}
