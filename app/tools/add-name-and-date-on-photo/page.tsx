import type { Metadata } from "next";
import Link from "next/link";
import { NameDateTool } from "@/components/tools/name-date-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("add-name-and-date-on-photo");

const description =
  "Add name and date on photo online for PSC and other forms. Crop the photo, print your name and the photo date below it, and save a JPG, with a Kerala PSC preset.";

export const metadata: Metadata = pageMetadata({
  title: "Add Name and Date on Photo Online – Kerala PSC Photo Maker",
  description,
  path: tool.path,
});

const KERALA_NOTICE = "https://keralapsc.gov.in/sites/default/files/2026-01/noti-880-25.pdf";
const KERALA_SIZE_NOTICE = "https://www.keralapsc.gov.in/sites/default/files/2019-02/NOTI-DEPT-MRH-16.pdf";

const faqs: FaqItem[] = [
  {
    question: "How do I add my name and date on a photo?",
    answer:
      "Drop your photo, type your name, check the photo date and select Add name and date. Both are printed in black on a white strip at the bottom, and the face area is cropped to fit above it.",
  },
  {
    question: "What size is the Kerala PSC photo?",
    answer:
      "Kerala PSC asks for a JPG 200 pixels high and 150 wide, at most 30 KB, with the candidate's name and the date the photo was taken printed legibly at the bottom. The Kerala PSC preset makes exactly that.",
  },
  {
    question: "Which date should I print?",
    answer:
      "The date the photo was taken, not today's date if they differ. Kerala PSC asks new profiles for a photo taken within six months, so check your notification's rule.",
  },
  {
    question: "Can I use a different size or date format?",
    answer:
      "Yes. Choose Custom size to enter any width and height in pixels and an optional KB limit, and pick DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY or a short month name.",
  },
  {
    question: "Can I type my name in Malayalam, Hindi or Tamil?",
    answer:
      "Yes, if your device has a font for that script, which phones and computers usually do. Check the preview before downloading; most forms expect the name as in your application.",
  },
  {
    question: "Is my photo uploaded?",
    answer: "No. The text is drawn and the JPG is made by your browser, on your device.",
  },
];

export default function AddNameAndDateOnPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Add Name and Date on Photo"
      intro={
        <p>
          Print your name and the date the photo was taken under your photo, at the exact pixel size and KB limit your
          application wants.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Kerala PSC photo with name and date</h2>
          <p>
            Kerala PSC notices ask for the name of the candidate and the date the photograph was taken to be printed legibly
            at the bottom, on a 150 × 200 pixel JPG of up to 30 KB with a white or light background (
            <a href={KERALA_NOTICE} target="_blank" rel="noopener noreferrer">
              Notification 880/2025
            </a>
            ,{" "}
            <a href={KERALA_SIZE_NOTICE} target="_blank" rel="noopener noreferrer">
              photo specification
            </a>
            ; checked 30 October 2026). The preset applies all of it. Not affiliated with Kerala PSC.
          </p>

          <h2>Photo with name and date for other forms</h2>
          <p>
            Other PSC and recruitment notices sometimes ask for the same caption. Use Custom size with the pixels and KB they
            state. If the background isn&apos;t plain, fix it first with the{" "}
            <Link href="/tools/white-background-photo">white background photo</Link> tool, then add the name and date here.
          </p>

          <h2>Tips for a readable caption</h2>
          <ul>
            <li>Type the name exactly as in your application; long names shrink automatically to fit.</li>
            <li>Crop so the face and shoulders fill the frame; the caption takes the bottom strip.</li>
            <li>
              Need the signature on the same image? Use the <Link href="/tools/merge-photo-and-signature">photo and signature joiner</Link>.
            </li>
          </ul>

          <PrivacyNote>
            <p>Your photo and the text you type stay on your device; nothing is uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <NameDateTool />
    </ToolPageShell>
  );
}
