import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { DocumentScannerTool } from "@/components/tools/document-scanner-tool";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("document-scanner");

const description =
  "Free online document scanner: turn phone photos of certificates and documents into a straight, clean scanned PDF, even under 200 KB. Nothing is uploaded.";

export const metadata: Metadata = pageMetadata({
  title: "Document Scanner Online – Phone Photo to Scanned PDF, Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "Is this a CamScanner alternative?",
    answer:
      "For everyday scans, yes: it straightens the page, cleans the background and saves a PDF in your browser, with no app, sign-up or watermark, and nothing is uploaded.",
  },
  {
    question: "How do I scan a certificate to a 200 KB PDF?",
    answer: "Photograph the certificate, check the corners, choose 200 KB as the PDF size limit and select Make PDF. The result shows its exact size.",
  },
  {
    question: "What if the page edges aren't found?",
    answer:
      "Drag the four corner handles onto the page corners yourself. Edges are found most easily when the page lies on a darker surface, such as a table.",
  },
  {
    question: "Can I scan several pages into one PDF?",
    answer: "Yes. Add up to 20 photos, one per page, put them in order with the arrows, and they become one PDF.",
  },
  {
    question: "Are my documents uploaded?",
    answer: "No. The pages are straightened, cleaned and saved by your browser on your device; nothing is sent to a server.",
  },
];

export default function DocumentScannerPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Document Scanner Online: Phone Photo to Scanned PDF"
      intro={<p>Scan document to PDF from your phone: photograph a certificate, ID or form and get a straight, clean, small PDF.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to scan a document to PDF with your phone</h2>
          <ol>
            <li>Lay the page flat on a darker table, in daylight, and take a photo from straight above.</li>
            <li>Add the photo; the page corners are found automatically. Drag any corner that&apos;s off.</li>
            <li>Choose Colour, Grey or Black &amp; white, and a size limit if the form has one.</li>
            <li>
              Select <strong>Make PDF</strong> and download your scanned PDF.
            </li>
          </ol>

          <h2>Colour, grey or black &amp; white?</h2>
          <p>
            <strong>Colour</strong> keeps stamps, photos and coloured ink: best for certificates and ID cards.{" "}
            <strong>Black &amp; white</strong> gives the crispest text and the smallest file for typed pages; <strong>Grey</strong>{" "}
            sits in between. Already have a PDF that&apos;s too big? Use <Link href="/tools/compress-pdf-to-200kb">compress PDF to
            200KB</Link>.
          </p>

          <PrivacyNote>
            <p>Your documents are scanned in your browser and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <DocumentScannerTool />
    </ToolPageShell>
  );
}
