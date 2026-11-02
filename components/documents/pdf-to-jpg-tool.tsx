"use client";

import { useState } from "react";
import { Segmented } from "@/components/controls/fields";
import { runDocumentRequest } from "@/lib/documents/client";
import { DocumentToolError } from "@/lib/documents/errors";
import { assertPdfHeader, DOC_LIMITS } from "@/lib/documents/validate";
import { formatBytes, KB } from "@/lib/utils/format";
import { SingleFileConverter } from "./single-file-converter";

type Dpi = "72" | "150" | "300";
type Limit = "none" | "50" | "100" | "200" | "500";

const DPI_HINT: Record<Dpi, string> = {
  "72": "Screen size: small files for email and chat.",
  "150": "Sharp on screen and fine for most forms and printing at home.",
  "300": "Print quality: large files with the most detail.",
};

/** PDF to JPG, or with format "png" PDF to PNG: lossless pages, so there's no size limit to offer. */
export function PdfToJpgTool({ format = "jpg" }: { format?: "jpg" | "png" } = {}) {
  const [dpi, setDpi] = useState<Dpi>("150");
  const [limit, setLimit] = useState<Limit>("none");
  const label = format === "png" ? "PNG" : "JPG";
  const maxBytes = format === "jpg" && limit !== "none" ? Number(limit) * KB : undefined;

  return (
    <SingleFileConverter
      tool={format === "png" ? "pdf-to-png" : "pdf-to-jpg"}
      accept=".pdf,application/pdf"
      hint={`PDF up to ${formatBytes(DOC_LIMITS.pdfToJpgMaxBytes)} and ${DOC_LIMITS.pdfToJpgMaxPages} pages`}
      prompt={`Drop a PDF to convert to ${label}`}
      buttonLabel="Choose PDF file"
      inputLabel="PDF"
      outputLabel={`${label} images`}
      actionLabel={`Convert to ${label}`}
      busyLabel={`Converting to ${label}…`}
      downloadLabel="Download"
      settingsKey={`${format}-${dpi}-${limit}`}
      check={async (file) => {
        assertPdfHeader(new Uint8Array(await file.slice(0, 1024).arrayBuffer()), file.size, DOC_LIMITS.pdfToJpgMaxBytes);
      }}
      convert={async (file, { signal, onProgress }) => {
        const result = await runDocumentRequest(
          { type: "pdf-to-jpg", data: await file.arrayBuffer(), dpi: Number(dpi), maxBytes, format, title: file.name.replace(/\.[^.]+$/, "") },
          { signal, onProgress, timeoutMs: 10 * 60_000 },
        );
        if (result.type !== "pdf-to-jpg") throw new DocumentToolError("CONVERSION_FAILED", "The conversion didn't complete. Please try again.");
        const notes: string[] = [];
        if (result.kind === "zip") notes.push(`The ${result.pages} ${label}s are in one ZIP file, numbered by page. Open it to get the images.`);
        if (maxBytes && result.overLimit > 0) {
          notes.push(
            `${result.overLimit} ${result.overLimit === 1 ? "page is" : "pages are"} still above ${formatBytes(maxBytes)} at the smallest readable size. Choose a larger limit, or crop the image afterwards.`,
          );
        } else if (result.reduced > 0) {
          notes.push(
            `${result.reduced} ${result.reduced === 1 ? "page was" : "pages were"} saved at a lower resolution than ${dpi} DPI to ${maxBytes ? `stay within ${formatBytes(maxBytes)}` : "stay within the browser's image size limit"}.`,
          );
        }
        return {
          blob: new Blob([result.bytes as BlobPart], { type: result.kind === "zip" ? "application/zip" : result.kind === "png" ? "image/png" : "image/jpeg" }),
          fileName: result.fileName,
          details: [`${result.pages} ${result.pages === 1 ? "page" : "pages"}`, `${dpi} DPI`, ...(result.kind === "zip" ? [`largest image ${formatBytes(result.largest)}`] : [])],
          notes,
        };
      }}
      beforeConvert={
        <div className={format === "jpg" ? "grid gap-5 sm:grid-cols-2" : "max-w-md"}>
          <Segmented<Dpi>
            legend="Resolution"
            value={dpi}
            onChange={setDpi}
            hint={DPI_HINT[dpi]}
            options={[
              { value: "72", label: "72 DPI" },
              { value: "150", label: "150 DPI" },
              { value: "300", label: "300 DPI" },
            ]}
          />
          {format === "jpg" ? (
            <Segmented<Limit>
              legend="Maximum size per image"
              value={limit}
              onChange={setLimit}
              hint={limit === "none" ? "Highest quality at the chosen resolution." : "Each JPG is kept at or under this size, for upload forms."}
              options={[
                { value: "none", label: "No limit" },
                { value: "50", label: "50 KB" },
                { value: "100", label: "100 KB" },
                { value: "200", label: "200 KB" },
                { value: "500", label: "500 KB" },
              ]}
            />
          ) : null}
        </div>
      }
    />
  );
}
