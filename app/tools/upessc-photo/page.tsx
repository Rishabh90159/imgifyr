import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("upessc-photo");
const app = APPLICATIONS.upessc;

const description =
  "UPESSC's myOTR asks for a photo, signature and hand-written declaration, each a JPG or PNG of 10–100 KB, for UP TGT 2026 and every UPESSC exam. Make them here.";

export const metadata: Metadata = pageMetadata({
  title: "UPESSC Photo & Signature Size – UP TGT OTR Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the UP TGT 2026 photo and signature size?",
    answer:
      "For UP TGT (advertisement 07/2026) the photo and signature are uploaded in the UPESSC One Time Registration, not in the TGT form. The commission's myOTR manual sets the photograph and the signature each as a JPG or PNG between 10 KB and 100 KB. No pixel size is given.",
  },
  {
    question: "What is the UPESSC hand-written declaration?",
    answer:
      "On the OTR Documents page the portal displays a declaration. You write it out by hand, then upload a photo or scan of the page as a JPG or PNG of 10–100 KB. Write the text exactly as the portal shows it, on white paper in dark ink, and crop away the background before making the file.",
  },
  {
    question: "Is UPESSC the same as UPSSSC?",
    answer:
      "No. UPESSC is the Uttar Pradesh Education Services Selection Commission, which recruits teachers, lecturers, principals and headmasters through upessc.up.gov.in. UPSSSC is the Subordinate Services Selection Commission on upsssc.gov.in, with its own OTR and different limits (photo 50–100 KB, signature 30–50 KB). Use the page for the commission you are applying to.",
  },
  {
    question: "Does UPESSC take a live photo as well?",
    answer:
      "Yes. When you create your account the portal captures a live photograph with your camera, or with a phone through the “Live QR” option, and checks it for liveness. The manual says that verified photo is used by the portal, including on the admit card. The passport-size photo is uploaded separately in the OTR Documents step.",
  },
  {
    question: "What size should certificates and marksheets be for UPESSC?",
    answer:
      "PDF only, between 20 KB and 200 KB. That covers the photo ID proof and marksheets in the OTR, and the extra certificates the TGT, Principal and Headmaster forms ask for (such as a B.Ed or TET certificate for TGT). Use the PDF compressor if a scan is larger.",
  },
  {
    question: "Do I upload a new photo for each UPESSC exam?",
    answer:
      "No. Exam applications reuse the photo, signature and marksheets from your OTR profile and only add exam-specific certificates. The TGT (07/2026), Principal (08/2026) and Headmaster (09/2026) forms work this way, so the files you make here serve all of them.",
  },
];

export default function UpesscPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="UPESSC (UP TGT) Photo, Signature and Declaration Size"
      intro={
        <p>
          Every UPESSC application, including UP TGT 2026, uses the photo, signature and hand-written declaration from your
          One Time Registration. Here are the limits from the commission&apos;s own portal manual, and a tool that makes
          all three files. Not affiliated with the Uttar Pradesh Education Services Selection Commission.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Which applications use these files</h2>
          <p>
            UPESSC moved its applications to the myOTR candidate portal (apply.upessc.org, linked from upessc.up.gov.in).
            You register once, complete the OTR profile, and then apply for each exam from &ldquo;Available Exams&rdquo;.
            Open as we write this:
          </p>
          <ul>
            <li>
              <strong>Assistant Teacher, Graduate Scale (TGT), advertisement 07/2026:</strong> 24 October to 23 November
              2026.
            </li>
            <li>
              <strong>Principal, Intermediate College (08/2026)</strong> and{" "}
              <strong>Headmaster, High School (09/2026):</strong> 23 October to 22 November 2026.
            </li>
          </ul>
          <p>
            These forms don&apos;t ask for the photo or signature again; they only add certificates as PDFs of 20–200 KB.
            Check the portal for the current list and dates.
          </p>

          <h2>Preparing the photograph and signature</h2>
          <ol>
            <li>
              The manual only says &ldquo;passport size&rdquo; for the uploaded photo, so its live-photo rules are a safe
              guide: plain, well-lit background, face and both ears visible, no cap, mask or dark glasses. Pick{" "}
              <strong>Photograph</strong>, crop from just above the head to the shoulders and create the file.
            </li>
            <li>
              Sign on white paper in dark ink. Pick <strong>Signature</strong>, crop close around it, keep the paper clean-up
              on and create the file.
            </li>
            <li>Both must be between 10 KB and 100 KB. The tool makes a JPG, which the portal accepts alongside PNG.</li>
          </ol>

          <h2>The hand-written declaration</h2>
          <p>
            The OTR Documents step shows a declaration to copy by hand. Write it in full, as displayed, on white paper in
            dark ink, and photograph the page flat in good light. Pick{" "}
            <strong>Hand-written declaration</strong> in the tool, crop to the written area and create a 10–100 KB file. The
            tool can&apos;t check the wording, so read it once against the portal before uploading.
          </p>

          <h2>The live photograph at registration</h2>
          <p>
            Creating the account captures a live photo through your camera, or a phone through &ldquo;Live QR&rdquo; if the
            computer has none, and the portal checks it for liveness. The manual asks you to keep the camera at eye level,
            use a plain, well-lit background, look straight at the camera, keep your face and both ears visible, and not wear
            a cap, mask or dark glasses. There is nothing to resize for this step.
          </p>

          <h2>Fixing a file that is too small or too large</h2>
          <ul>
            <li>
              <strong>Under 10 KB</strong> (common for signatures): the tool offers to enlarge it, or use the{" "}
              <Link href="/tools/image-size-increase">image size increaser</Link>.
            </li>
            <li>
              <strong>Over 100 KB:</strong> the tool reduces it automatically; the{" "}
              <Link href="/tools/100kb-photo">100KB photo resizer</Link> does the same for any image.
            </li>
            <li>
              <strong>Certificate or marksheet PDF over 200 KB:</strong> use the{" "}
              <Link href="/tools/compress-pdf">PDF compressor</Link>; turn phone photos of documents into a PDF with{" "}
              <Link href="/tools/jpg-to-pdf">JPG to PDF</Link>, which can keep it under a size you choose.
            </li>
            <li>
              Applying to UPSSSC too? It has its own OTR and limits: see the{" "}
              <Link href="/tools/upsssc-photo">UPSSSC photo and signature page</Link>.
            </li>
          </ul>

          <h2>How we keep this page accurate</h2>
          <p>
            The limits come from UPESSC&apos;s myOTR user manual, section 4.6 (Documents), checked against the portal&apos;s
            published TGT, Principal and Headmaster application forms on the date shown above. If the upload screen or a new
            advertisement gives a different limit, follow it, and we update the page when we re-read the source. See{" "}
            <Link href="/methodology">how the tools work</Link>.
          </p>

          <PrivacyNote>
            <p>
              Your photo, signature and declaration are prepared on your device and not sent to this site. Upload them only
              on the UPESSC portal.
            </p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="UPESSC Photo, Signature and Declaration Size at a Glance" app={app} />
        <RequirementPhotoTool tool="upessc-photo" sets={app.sets} setLabel="UPESSC registration" appName="UPESSC" />
      </div>
    </ToolPageShell>
  );
}
