import type { Metadata } from "next";
import Link from "next/link";
import { CompressPdfTool } from "@/components/documents/compress-pdf-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("compress-pdf-to-200kb");

const description =
  "Reduce PDF size to 200KB for certificates, mark sheets and ID proofs on upload forms. Compress PDF to 200KB in your browser: free, fast and never uploaded.";

export const metadata: Metadata = pageMetadata({
  title: "Compress PDF to 200KB – PDF Size Reducer to 200KB Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How can I make a PDF 200KB?",
    answer: "Open it here with 200 KB preselected, press Compress, and save the new file. The result panel shows the size in KB.",
  },
  {
    question: "Which documents usually need to be under 200 KB?",
    answer:
      "Upload forms commonly set a limit around 200 KB for certificates, mark sheets and ID proofs, but limits vary: check the one your form states.",
  },
  {
    question: "My certificate is a photo, not a PDF. What now?",
    answer: "Turn it into a PDF with photo to PDF first, then compress it here, or set the 200 KB limit there directly.",
  },
  {
    question: "Does compressing to 200 KB remove the text?",
    answer:
      "Only if pages have to become images to fit. Then they look the same but text can't be selected. A scan was already an image, so nothing changes for it.",
  },
  {
    question: "Do you keep a copy of my document?",
    answer: "No. The PDF is processed in your own browser and never sent to a server.",
  },
];

export default function CompressPdfTo200kbPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Compress PDF to 200KB"
      intro={<p>Bring certificates, mark sheets and ID proofs down to the 200 KB limit many upload forms use.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Compress a PDF to 200KB in three steps</h2>
          <ol>
            <li>Pick the document; 200 KB is set for you.</li>
            <li>
              Press <strong>Compress</strong>; the result shows the new size.
            </li>
            <li>Confirm the size, then download the smaller PDF.</li>
          </ol>

          <h2>Certificates and mark sheets at 200 KB</h2>
          <p>
            Most certificates are scans, and scans shrink well, so a short scanned document can often fit in 200 KB. If the
            form wants several documents in one file, <Link href="/tools/merge-pdf">merge them</Link> first and compress the
            result. Tighter limit? Use <Link href="/tools/compress-pdf-to-100kb">compress PDF to 100KB</Link>.
          </p>

          <PrivacyNote>
            <p>Your document stays on your device while it is compressed.</p>
          </PrivacyNote>
        </>
      }
    >
      <CompressPdfTool tool="compress-pdf-to-200kb" defaultKB={200} />
    </ToolPageShell>
  );
}
