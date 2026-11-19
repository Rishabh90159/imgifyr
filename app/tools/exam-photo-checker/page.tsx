import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { PhotoCheckerTool } from "@/components/tools/photo-checker-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { KIT_EXAMS, toKitSet, type KitExam } from "@/lib/requirements/kit";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("exam-photo-checker");

const description =
  "Check your exam photo or signature before you upload it: file type, pixel size, KB, DPI, background, light and blur, against SSC, RRB, NEET, PAN and more.";

export const metadata: Metadata = pageMetadata({
  title: "Exam Photo Checker – Why Is My Photo Rejected? Free Check",
  description,
  path: tool.path,
});

// Same exams and requirement data as the all-exam kit, built on the server.
const exams: KitExam[] = KIT_EXAMS.map(({ id, tool: examTool, group }) => ({
  id,
  name: APPLICATIONS[id].name,
  path: getTool(examTool).path,
  group,
  sets: APPLICATIONS[id].sets.filter((s) => s.photo || s.signature || s.livePhotoCapture).map(toKitSet),
})).filter((e) => e.sets.length > 0);

const faqs: FaqItem[] = [
  {
    question: "Why is my photo rejected in SSC form?",
    answer:
      "SSC's current notices capture your photo live in the form, so rejections there come from light, background or framing: practise first. For the signature, SSC says blurred or miniature signatures are rejected.",
  },
  {
    question: "Can I rename a PNG to JPG to make it upload?",
    answer:
      "No. Portals read the file itself, and the checker does the same: a renamed PNG is flagged. Convert it properly with the image to JPG tool.",
  },
  {
    question: "How does the signature checker work?",
    answer:
      "Choose Signature: it finds the ink and checks that it fills most of the image, is dark enough and sits on clean white paper, plus the form's pixel and KB limits.",
  },
  {
    question: "If every check passes, will my photo be accepted?",
    answer:
      "It meets everything that can be measured. Officials also judge pose, expression and how recent the photo is, so verify against the latest notice before submitting.",
  },
  {
    question: "Is my photo uploaded for checking?",
    answer: "No. The check runs in your browser, on your device. Your photo is never sent anywhere.",
  },
];

export default function ExamPhotoCheckerPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Exam Photo Checker: Will My Photo Be Rejected?"
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>What the photo checker looks at</h2>
          <ul>
            <li>
              <strong>Measured exactly:</strong> the real file type (not just the name), pixel size or shape, file size in KB,
              DPI and phone rotation tags, against the form you pick.
            </li>
            <li>
              <strong>Estimated from the pixels:</strong> light on the face, a plain background and sharpness for photos; ink
              size, darkness and clean paper for signatures.
            </li>
          </ul>
          <p>
            Each problem has a <strong>Fix it</strong> button that opens the right tool with your file, such as the exam&apos;s own
            page or the <Link href="/tools/white-background-photo">white background tool</Link>.
          </p>

          <h2>Photo rejected in exam form? Common reasons</h2>
          <ul>
            <li>A PNG or iPhone HEIC file renamed to .jpg, or a file over the KB limit.</li>
            <li>The wrong pixel size or shape, often a photo turned sideways.</li>
            <li>A dark face, a busy background, or a signature too small in its image.</li>
            <li>
              For live photo forms (SSC, RRB, UP Police): light and framing at the moment of capture. Try{" "}
              <Link href="/tools/live-photo-practice">live photo practice</Link>.
            </li>
          </ul>

          <PrivacyNote>
            <p>Your photo is checked in your browser and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <PhotoCheckerTool exams={exams} />
    </ToolPageShell>
  );
}
