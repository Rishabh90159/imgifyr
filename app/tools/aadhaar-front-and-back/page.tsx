import type { Metadata } from "next";
import Link from "next/link";
import { FrontBackTool } from "@/components/tools/front-back-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("aadhaar-front-and-back");

const description =
  "Put Aadhaar card front and back in one page: a printable A4 PDF at card size, or one JPG, under a KB limit you set. Works for PAN and any ID. Nothing is uploaded.";

export const metadata: Metadata = pageMetadata({
  title: "Aadhaar Front and Back in One Page – PDF or JPG, Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I put my Aadhar card front and back in one page?",
    answer:
      "Add a photo or scan of the front, then the back. Choose PDF for an A4 page or JPG for one image, set a KB limit if the form gives one, and select Combine.",
  },
  {
    question: "Will it print at the real card size?",
    answer:
      "Yes. With PDF and Card size, each side is placed 8.56 × 5.4 cm on the A4 page, the size of a PVC card, when printed at 100% (no “fit to page”).",
  },
  {
    question: "Can I keep the file under 100 KB or 200 KB?",
    answer:
      "Yes. Type the limit under Max file size. The picture is compressed and, if needed, made smaller until the PDF or JPG fits, with both sides kept readable.",
  },
  {
    question: "Does it work for PAN card, voter ID or a mark sheet?",
    answer:
      "Yes. It combines any two pictures. Card size suits Aadhaar, PAN, driving licence and bank cards; use Fit the page for larger documents.",
  },
  {
    question: "Is my Aadhaar uploaded anywhere?",
    answer:
      "No. Both sides are combined by your browser on your own device and never sent to a server, so the card details stay with you.",
  },
];

export default function AadhaarFrontAndBackPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Aadhaar Card Front and Back in One Page"
      intro={
        <p>
          Combine two photos into one page: the front and back of an Aadhaar, PAN or any ID card, as a PDF or a single JPG.
          Not affiliated with UIDAI.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Combine front and back in three steps</h2>
          <ol>
            <li>Photograph each side flat on a dark table, in daylight, with no glare across the text.</li>
            <li>Add the front, then the back. Crop away the table first with the <Link href="/tools/image-cropper">image cropper</Link> for a sharper result.</li>
            <li>Pick PDF or JPG and a KB limit if you need one, select Combine, then download.</li>
          </ol>

          <h2>PDF page or JPG image?</h2>
          <p>
            Choose <strong>PDF</strong> to print, or when a form asks for one PDF with both sides. Choose <strong>JPG</strong> when the
            upload field takes only images. For more than two pictures in one image, use{" "}
            <Link href="/tools/merge-images">merge images</Link>; to shrink an existing PDF, use the{" "}
            <Link href="/tools/compress-pdf">PDF compressor</Link>.
          </p>

          <h2>Masked Aadhaar and safety</h2>
          <p>
            Where only identity proof is needed, many offices accept the masked Aadhaar that hides the first eight digits. Your
            card stays on your device here, so no copy is left on a website.
          </p>

          <PrivacyNote>
            <p>Both sides are combined in your browser and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <FrontBackTool />
    </ToolPageShell>
  );
}
