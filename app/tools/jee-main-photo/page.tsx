import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("jee-main-photo");
const app = APPLICATIONS.jee;

const description =
  "JEE Main 2027 asks for a 10–200 KB JPG photo (white background, 80% face, ears visible) and a 10–100 KB JPG signature. Make both here, free, from NTA's bulletin.";

export const metadata: Metadata = pageMetadata({
  title: "JEE Main Photo & Signature Size 2027 – KB Converter",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the JEE Main photo size?",
    answer:
      "The JEE (Main) 2027 Information Bulletin asks for a recent scanned passport-size photograph in colour, against a white background, with the face (including ears, without a mask) covering 80% of the photo. The file must be a JPG/JPEG between 10 KB and 200 KB.",
  },
  {
    question: "What is the JEE Main signature size?",
    answer:
      "A JPG/JPEG between 10 KB and 100 KB, clearly legible. Websites quoting 4–30 KB or 10–200 KB for the signature are not following the 2027 bulletin.",
  },
  {
    question: "What is the JEE Main photo size in pixels or cm?",
    answer:
      "NTA doesn't give one. The 2027 bulletin sets only the format (JPG/JPEG), the file size and what the photo must show. Pixel or centimetre sizes on other websites aren't from NTA, so this tool doesn't force any: it keeps your crop and only makes it smaller if that's needed to stay under the KB limit.",
  },
  {
    question: "Do I still upload a photo if JEE Main takes a live photo?",
    answer:
      "Yes, both. The bulletin says you capture a live photograph while filling in the form (with a webcam, or a phone through the QR code) and also upload your scanned passport-size photograph. Both need a white background, good light and 80% of the frame showing your face with ears visible.",
  },
  {
    question: "Can I change my photo or signature after submitting?",
    answer:
      "Only during the correction window, which for Session 1 runs from 27 to 29 November 2026. After it closes NTA doesn't accept changes to the uploaded images, and the same application number is carried into Session 2, so check both files before you pay.",
  },
  {
    question: "What other files does the JEE Main 2027 form ask for?",
    answer:
      "Your Class 10 (or equivalent) certificate or marksheet as a PDF of 50–300 KB, and where it applies, a disability/UDID certificate or a non-Indian passport as a PDF of 50–300 KB. The PDF compressor can bring a scan into that range.",
  },
];

export default function JeeMainPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="JEE Main 2027 Photo and Signature Size"
      intro={
        <p>
          The photo and signature limits from NTA&apos;s JEE (Main) 2027 Information Bulletin, and a tool that makes both
          files to match, in your browser. Not affiliated with the National Testing Agency.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to make the JEE Main photo</h2>
          <ol>
            <li>Take a recent colour photo against a white wall in good light, without a mask, with both ears visible.</li>
            <li>
              Add it to the tool with <strong>Photograph</strong> selected and crop so your face fills about 80% of the
              frame.
            </li>
            <li>
              Select <strong>Create photo file</strong>. The checklist confirms a JPG between 10 KB and 200 KB; then
              download it.
            </li>
          </ol>

          <h2>How to make the JEE Main signature</h2>
          <ol>
            <li>Sign on plain white paper with a dark pen, and photograph or scan it.</li>
            <li>
              Switch the tool to <strong>Signature</strong>, crop close around the signature and keep the paper clean-up
              on.
            </li>
            <li>Create the file and check it is a JPG of 10–100 KB.</li>
          </ol>

          <h2>JEE Main 2027 application dates</h2>
          <ul>
            <li>
              <strong>Session 1 (January 2027):</strong> apply from 24 October to 22 November 2026 (late fee of Rs. 500
              from 23 to 26 November), corrections 27–29 November 2026, exams on 20–24 and 28 January 2027.
            </li>
            <li>
              <strong>Session 2 (April 2027):</strong> apply from 5 January to 3 February 2027, with the same application
              number if you applied for Session 1. Exams are on 2–7 April 2027.
            </li>
          </ul>
          <p>
            Dates are from the bulletin and NTA&apos;s public notice of 24 October 2026; NTA announces changes on
            jeemain.nta.nic.in.
          </p>

          <h2>Common reasons a JEE Main photo is a problem</h2>
          <ul>
            <li>
              <strong>Face too small.</strong> A half-body photo doesn&apos;t meet the 80% face rule. Crop in.
            </li>
            <li>
              <strong>Ears hidden, mask on or a coloured background.</strong> The bulletin asks for ears visible, no mask and
              a white background.
            </li>
            <li>
              <strong>Someone else&apos;s, edited or morphed photo.</strong> The bulletin treats wrong or morphed photographs
              and signatures as unfair means. Cropping and resizing are fine; filters and face edits are not.
            </li>
            <li>
              <strong>A different photo on exam day.</strong> You paste 2 more prints of the same photo on the admit card
              and attendance sheet, so keep copies of the one you upload.
            </li>
          </ul>

          <h2>Fixing a file outside the limits</h2>
          <ul>
            <li>
              <strong>Under 10 KB:</strong> the tool offers to enlarge it; the{" "}
              <Link href="/tools/image-size-increase">image size increaser</Link> also adds bytes without changing the
              picture.
            </li>
            <li>
              <strong>Over the maximum:</strong> the tool reduces it automatically. For a plain size limit you can also use
              the <Link href="/tools/200kb-photo">200KB photo resizer</Link>.
            </li>
            <li>
              <strong>Class 10 marksheet PDF over 300 KB:</strong> use the{" "}
              <Link href="/tools/compress-pdf">PDF compressor</Link>; if it&apos;s a photo, turn it into a PDF with{" "}
              <Link href="/tools/jpg-to-pdf">JPG to PDF</Link> first.
            </li>
            <li>
              Applying for NEET as well? NTA&apos;s NEET bulletin has its own limits on the{" "}
              <Link href="/tools/neet-photo">NEET photo resizer</Link>.
            </li>
          </ul>

          <h2>How we keep this page accurate</h2>
          <p>
            The limits come from the JEE (Main) 2027 Information Bulletin, linked above with the date we read it. NTA
            publishes a new bulletin each year; when it does, or when a public notice changes the upload rules, we re-read it
            and update the data. If the application form shows a different limit, follow the form. See{" "}
            <Link href="/methodology">how the tools work</Link>.
          </p>

          <PrivacyNote>
            <p>
              Your photo and signature are prepared on your own device and aren&apos;t sent to this site. Upload them only
              on jeemain.nta.nic.in.
            </p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="JEE Main Photo Size in KB and Signature Size at a Glance" app={app} />
        <RequirementPhotoTool tool="jee-main-photo" sets={app.sets} setLabel="Information bulletin" appName="JEE Main" />
      </div>
    </ToolPageShell>
  );
}
