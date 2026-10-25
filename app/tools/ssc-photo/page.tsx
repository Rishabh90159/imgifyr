import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("ssc-photo");
const app = APPLICATIONS.ssc;

const description =
  "SSC now captures your photo live in the application form. See the rules from the official 2026 notices and resize your signature to a 10–20 KB JPEG.";

export const metadata: Metadata = pageMetadata({
  title: "SSC Photo & Signature Requirements – SSC Signature Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the current SSC photo requirement?",
    answer:
      "For CGL 2026 and CHSL 2026 you don't upload a photo: the form captures it with your camera. Use good light, a plain background and the camera at eye level, with no cap, mask or glasses.",
  },
  {
    question: "What size should my SSC photo be?",
    answer:
      "There is no photo file size for these exams, because nothing is uploaded. Pointing the camera at an existing printed photo is not allowed and leads to rejection.",
  },
  {
    question: "What is the SSC signature size?",
    answer: "A JPEG/JPG of 10–20 KB, about 6.0 cm wide by 2.0 cm high. Blurred or miniature signatures are rejected.",
  },
  {
    question: "Can I resize my SSC signature online?",
    answer:
      "Yes. Add a photo of your signature, crop it to the 3:1 box, whiten the paper and download a 10–20 KB JPG. It runs in your browser.",
  },
  {
    question: "Will I need printed photos for SSC?",
    answer:
      "The CGL 2026 notice asks for two passport-size colour photos at document verification; CHSL 2026 asks candidates without Aadhaar authentication to bring two to the exam.",
  },
];

export default function SscPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="SSC Photo and Signature Requirements"
      intro={
        <p>
          SSC takes your photo live in the form, so the only file to prepare is your signature. Not affiliated with the Staff
          Selection Commission.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make the SSC signature</h2>
          <ol>
            <li>Sign in your usual way with a dark pen on plain white paper, then scan or photograph it straight on.</li>
            <li>Pick your exam above, add the image and fit the 3:1 crop box tightly around the ink.</li>
            <li>
              Keep the paper clean-up on and select <strong>Create signature file</strong>. Download it once the checklist
              shows a JPG of 10–20 KB.
            </li>
          </ol>

          <h2>Before the live photo</h2>
          <p>
            Sit facing a window or an even light, against a plain wall, with the camera at eye level. Take off your cap, mask
            and glasses first, and look on exam day as you do in the photo.
          </p>

          <h2>Avoid these mistakes</h2>
          <ul>
            <li>Holding a printed photo up to the camera: the notices reject it.</li>
            <li>A small signature lost in white space. Crop close to the ink.</li>
            <li>
              Uploading a PNG. SSC wants JPEG, which this tool always saves. For a plain 20 KB limit, the{" "}
              <Link href="/tools/20kb-photo">20KB photo resizer</Link> also works.
            </li>
          </ul>

          <PrivacyNote>
            <p>Your signature is processed in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="SSC Signature Size and Photo Rules at a Glance" app={app} />
        <RequirementPhotoTool tool="ssc-photo" sets={app.sets} setLabel="SSC examination" appName="SSC" />
      </div>
    </ToolPageShell>
  );
}
