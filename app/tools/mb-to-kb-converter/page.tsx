import type { Metadata } from "next";
import Link from "next/link";
import { MbToKbConverter } from "@/components/tools/mb-to-kb-converter";
import { ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("mb-to-kb-converter");

const description =
  "Convert MB to KB, KB to MB and more. Shows decimal (1 MB = 1000 KB) and binary (1 MiB = 1024 KiB) results side by side, and the exact size of any file.";

export const metadata: Metadata = pageMetadata({
  title: "MB to KB Converter – Convert MB to KB Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How many KB are in 1 MB?",
    answer:
      "1,000 KB in decimal (SI) units, used by storage makers. In binary units 1 MiB is 1,024 KiB; Windows and many upload forms use this meaning but still write KB and MB.",
  },
  {
    question: "How do I convert MB to KB?",
    answer:
      "Multiply by 1,000 for decimal (2.5 MB = 2,500 KB) or by 1,024 for binary (2.5 MiB = 2,560 KiB). To go from KB to MB, divide by the same number.",
  },
  {
    question: "Which one does an upload form mean by “KB”?",
    answer:
      "Usually 1,024 bytes. The difference is small for photo limits (50 KB is 51,200 bytes in binary, 50,000 in decimal), so aim a little below the limit to be safe.",
  },
  {
    question: "Why does my phone show a different file size than my computer?",
    answer:
      "macOS, iOS and Android usually count in decimal, Windows in binary. The same 5,000,000-byte photo shows as 5 MB on a phone and 4.77 MB on Windows.",
  },
  {
    question: "What are KiB and MiB?",
    answer:
      "The IEC names for binary units: a kibibyte (KiB) is 1,024 bytes and a mebibyte (MiB) is 1,024 KiB. They exist because KB and MB were used for both meanings.",
  },
  {
    question: "How do I reduce a photo from MB to KB?",
    answer:
      "Converting units doesn't change the file. To fit a 3 MB photo under 100 KB, compress or resize the image itself with resize image to KB, which aims for the size you enter.",
  },
];

const COMMON = [0.1, 0.5, 1, 2, 5, 10];

export default function MbToKbPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="MB to KB Converter"
      intro={
        <p>
          Convert MB to KB and back, with decimal (1 MB = 1000 KB) and binary (1 MiB = 1024 KiB) results side by side. This
          file size converter also handles bytes and GB, and shows the exact size of any file.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>MB to KB: the two answers</h2>
          <p>
            Decimal (SI) units step by 1000; binary units step by 1024 and are properly called KiB and MiB. Both are correct;
            what matters is which one the site you&apos;re uploading to uses.
          </p>
          <div className="relative overflow-x-auto">
            <table>
              <caption className="sr-only">Common megabyte values in kilobytes</caption>
              <thead>
                <tr>
                  <th scope="col">Megabytes</th>
                  <th scope="col">Decimal (KB)</th>
                  <th scope="col">Binary (KiB)</th>
                </tr>
              </thead>
              <tbody>
                {COMMON.map((mb) => (
                  <tr key={mb}>
                    <td>{mb} MB</td>
                    <td>{(mb * 1000).toLocaleString("en-US")} KB</td>
                    <td>{(mb * 1024).toLocaleString("en-US", { maximumFractionDigits: 1 })} KiB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Which system to use</h2>
          <ul>
            <li>
              <strong>Drives, USB sticks and phone storage</strong> are sold in decimal units.
            </li>
            <li>
              <strong>Windows File Explorer</strong> shows binary sizes but labels them KB and MB.
            </li>
            <li>
              <strong>Upload forms</strong> with limits such as &ldquo;under 50 KB&rdquo; usually count 1 KB as 1024 bytes,
              as do the image tools on this site.
            </li>
          </ul>

          <h2>Getting a file under a KB limit</h2>
          <p>
            A KB converter only changes the numbers, not the file. To shrink a photo, use{" "}
            <Link href="/tools/resize-image-to-kb">resize image to KB</Link> or the one-step{" "}
            <Link href="/tools/20kb-photo">20KB</Link>, <Link href="/tools/50kb-photo">50KB</Link>,{" "}
            <Link href="/tools/100kb-photo">100KB</Link> and <Link href="/tools/200kb-photo">200KB</Link> pages. Without a
            fixed target, use the <Link href="/tools/image-compressor">image compressor</Link>.
          </p>
        </>
      }
    >
      <MbToKbConverter />
    </ToolPageShell>
  );
}
