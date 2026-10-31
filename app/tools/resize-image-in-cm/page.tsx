import type { Metadata } from "next";
import Link from "next/link";
import { PassportPhotoTool } from "@/components/tools/passport-photo-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("resize-image-in-cm");

const description =
  "Resize image in cm, mm or inches at 300 DPI or any resolution, with an optional min and max KB. Crop to shape, then download a JPG that prints at exactly that size.";

export const metadata: Metadata = pageMetadata({
  title: "Resize Image in CM, MM or Inches – Exact Print Size",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I resize an image to 3.5 × 4.5 cm?",
    answer:
      "Drop the photo, keep Centimetres, enter 3.5 and 4.5 and a DPI (300 is standard), then adjust the crop and select Create photo. At 300 DPI that's 413 × 531 pixels.",
  },
  {
    question: "How are centimetres turned into pixels?",
    answer:
      "Pixels = centimetres ÷ 2.54 × DPI, or millimetres ÷ 25.4 × DPI. At 200 DPI, 6 × 2 cm is 472 × 157 pixels. The DPI is also saved in the JPG so it prints at that size.",
  },
  {
    question: "Can I resize in cm and keep it under 50 KB?",
    answer:
      "Yes. Fill in Max file size; the pixel size never changes, only the JPG quality. Some forms also set a minimum, which you can enter too.",
  },
  {
    question: "Which DPI should I use?",
    answer:
      "Use the DPI your form or printer asks for. Without one, 300 is the usual choice for prints and photo labs; a lower DPI gives fewer pixels and a smaller file.",
  },
  {
    question: "Does it stretch my photo?",
    answer:
      "No. You choose which part to keep with the crop box, which has the exact shape of the size you entered, so the result is never squashed.",
  },
  {
    question: "Is my image uploaded?",
    answer: "No. Cropping, resizing and saving all happen in your browser.",
  },
];

export default function ResizeImageInCmPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Resize Image in CM, MM or Inches"
      intro={
        <p>
          Type a size in centimetres, millimetres or inches and a DPI, crop to that shape, and download a JPG that prints at
          exactly that size, under a KB limit if you need one.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Photo size in cm, mm and pixels</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">Size</th>
                <th scope="col">At 200 DPI</th>
                <th scope="col">At 300 DPI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>3.5 × 4.5 cm (35 × 45 mm)</td>
                <td>276 × 354 px</td>
                <td>413 × 531 px</td>
              </tr>
              <tr>
                <td>5 × 5 cm (50 × 50 mm)</td>
                <td>394 × 394 px</td>
                <td>591 × 591 px</td>
              </tr>
              <tr>
                <td>6 × 2 cm (signature)</td>
                <td>472 × 157 px</td>
                <td>709 × 236 px</td>
              </tr>
            </tbody>
          </table>

          <h2>Resize image in cm and KB together</h2>
          <p>
            Many forms give a print size and a file limit, such as 3.5 × 4.5 cm under 50 KB. Enter both: the crop sets the shape,
            the DPI sets the pixels, and the quality is lowered only as far as the limit needs. Switching units keeps the same
            real size, so 35 mm becomes 3.5 cm.
          </p>

          <h2>Only need a different DPI?</h2>
          <p>
            If the pixels are already right and only the DPI value is wrong, use{" "}
            <Link href="/tools/change-image-dpi">change DPI of image</Link>, which keeps the file untouched. For official
            passport sizes by country, use the <Link href="/tools/passport-photo-resizer">passport photo resizer</Link>.
          </p>

          <PrivacyNote>
            <p>Your image is cropped and resized on your device, never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <PassportPhotoTool
        tool="resize-image-in-cm"
        units={["cm", "mm", "in", "px"]}
        defaultCustom={{ unit: "cm", width: "3.5", height: "4.5", dpi: "300", minKB: "", maxKB: "" }}
        presets={false}
        guide="thirds"
      />
    </ToolPageShell>
  );
}
