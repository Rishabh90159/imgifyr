import type { Metadata } from "next";
import Link from "next/link";
import { PassportPhotoTool } from "@/components/tools/passport-photo-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { PHOTO_PRESETS, PRINT_DPI } from "@/lib/presets/photo-presets";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("passport-photo-resizer");

const description =
  "Crop and resize a photo for a passport, visa or ID application. Set the size in mm, inches or pixels plus a KB limit, or use an officially sourced preset.";

export const metadata: Metadata = pageMetadata({
  title: "Passport Photo Resizer – Resize Photos for Passport & Visa",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What size is a passport photo?",
    answer:
      "There is no single size: a UK print is 35 × 45 mm, a Canadian one 50 × 70 mm, and online forms usually give pixels and a KB range. Use the numbers in your application's official instructions.",
  },
  {
    question: "Does this tool guarantee my photo will be accepted?",
    answer:
      "No. It sets the dimensions, file type and file size you choose; authorities also judge lighting, expression, glasses, head position, background and recency. Check the final image against the official requirements before submitting.",
  },
  {
    question: "How do I convert millimetres to pixels for a passport photo?",
    answer: `Pixels = millimetres ÷ 25.4 × DPI, so at ${PRINT_DPI} DPI, 35 × 45 mm is 413 × 531 pixels. Choose Millimetres in Custom size and the tool converts it and records the DPI in the JPG.`,
  },
  {
    question: "My form needs the photo under 50 KB. Can this do that?",
    answer:
      "Yes. Enter 50 as the maximum file size and the tool finds the highest JPG quality that fits at your exact pixel size. If that's impossible, it tells you rather than silently shrinking the photo.",
  },
  {
    question: "Can it change the background to white?",
    answer:
      "No. Reliable background replacement needs person detection, and many authorities reject edited photos. Shoot against a plain, evenly lit wall in the colour your application asks for.",
  },
  {
    question: "Can I print several passport photos on one sheet?",
    answer:
      "Yes, for millimetre sizes. Pick a sheet below the result: a 35 × 45 mm photo fits 8 times on 4 × 6 in and 30 times on A4. Take the JPG to a photo shop, or print the PDF at home at 100%.",
  },
];

export default function PassportPhotoResizerPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Passport Photo Resizer"
      intro={
        <p>
          Crop and resize a photo to the exact size your passport, visa or ID application asks for, in millimetres, inches or
          pixels, with an optional KB limit. Your photo stays on your device.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How the passport photo resizer works</h2>
          <ol>
            <li>
              Choose a preset, or select <strong>Custom size</strong> and enter the width, height, unit and any KB limits from
              your official instructions.
            </li>
            <li>Add your photo; the crop box is locked to the required shape.</li>
            <li>Move and zoom until your head is centred and sized as the rules describe, using the dashed oval.</li>
            <li>Select Create photo, check the result, and download the JPG.</li>
          </ol>

          <h2>Presets checked against official sources</h2>
          <p>
            A printed passport, an online renewal and a visa can each need different dimensions, head size and file limits, so
            no universal &ldquo;passport size&rdquo; is assumed. Each preset links to the issuing government&apos;s page with
            the date it was last checked.
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">Preset</th>
                <th scope="col">Output</th>
                <th scope="col">Source</th>
              </tr>
            </thead>
            <tbody>
              {PHOTO_PRESETS.map((preset) => (
                <tr key={preset.id}>
                  <td>
                    {preset.country} – {preset.document}
                  </td>
                  <td>
                    {preset.widthMm && preset.heightMm ? `${preset.widthMm} × ${preset.heightMm} mm (` : ""}
                    {preset.widthPx} × {preset.heightPx} px{preset.widthMm ? ")" : ""}
                    {preset.minKB || preset.maxKB
                      ? `, ${preset.minKB ? `${preset.minKB} KB` : "0"}–${preset.maxKB ? (preset.maxKB >= 1024 ? `${preset.maxKB / 1024} MB` : `${preset.maxKB} KB`) : "any"}`
                      : ""}
                  </td>
                  <td>
                    <a href={preset.source.url} target="_blank" rel="noopener noreferrer">
                      {preset.source.name}
                    </a>{" "}
                    (verified {preset.lastVerified})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>
            Not sure of your country&apos;s rules? <Link href="/tools/passport-photo">Compare passport photo requirements by
            country</Link>, each with its official source.
          </p>

          <h2>Background and lighting</h2>
          <ul>
            <li>Stand about half a metre from a plain wall in the required colour, often white, cream or light grey.</li>
            <li>Face a window or soft, even light so no shadows fall on your face or behind you.</li>
            <li>Keep a neutral expression and have someone else shoot from head height; selfies distort proportions.</li>
          </ul>
          <p>There is no retouching or background replacement, because many authorities reject edited photos.</p>

          <h2>Print sheets and online uploads</h2>
          <p>
            For millimetre sizes, the JPG carries {PRINT_DPI} DPI, so it prints true to size at &ldquo;actual size&rdquo; or
            100%. A 4 × 6 in sheet holds 8 copies of a 35 × 45 mm photo and A4 holds 30, with cutting guides. For online
            forms, pixels and KB are what count: the{" "}
            <Link href="/tools/20kb-photo">20KB photo resizer</Link> and <Link href="/tools/50kb-photo">50KB photo
            resizer</Link> cover common limits, <Link href="/tools/resize-image-to-kb">resize image to KB</Link> any other, and
            the <Link href="/tools/signature-resizer">signature resizer</Link> prepares the signature.
          </p>

          <PrivacyNote>
            <p>Identity photos are sensitive, so cropping, resizing and compression all happen on your device.</p>
          </PrivacyNote>
        </>
      }
    >
      <PassportPhotoTool />
    </ToolPageShell>
  );
}
