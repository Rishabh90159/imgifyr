import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { ExamKitTool } from "@/components/tools/exam-kit-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { KIT_EXAMS, KIT_GROUPS, toKitSet, type KitExam } from "@/lib/requirements/kit";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("all-exam-photo-signature");

const description =
  "Photo and signature resizer for all exams: add both once, tick SSC, RRB, IBPS, NEET, PAN and more, and download every form's file in one ZIP. Free.";

export const metadata: Metadata = pageMetadata({
  title: "All Exam Photo & Signature Resizer – One Photo, Every Form",
  description,
  path: tool.path,
});

// Built on the server from the same data as the exam pages; only the photo and signature specs reach the browser.
const exams: KitExam[] = KIT_EXAMS.map(({ id, tool: examTool, group }) => ({
  id,
  name: APPLICATIONS[id].name,
  path: getTool(examTool).path,
  group,
  sets: APPLICATIONS[id].sets.filter((s) => s.photo || s.signature).map(toKitSet),
})).filter((e) => e.sets.length > 0);

const faqs: FaqItem[] = [
  {
    question: "Is there one photo size for all exams?",
    answer:
      "No. Each form sets its own pixel size, file size and shape, so a single file can't suit every exam. This photo resizer for all exams makes a separate file for each form from the same photo.",
  },
  {
    question: "Do I have to crop my photo for every exam?",
    answer:
      "No. Frame your head and shoulders once. For each form, the kit cuts its own shape around that framing, so your face stays in the same place.",
  },
  {
    question: "Why isn't UPSC in the list?",
    answer:
      "UPSC publishes its photo and signature limits only inside its application portal, so there are no verified numbers to apply. Use the UPSC photo resizer with the values from your instructions.",
  },
  {
    question: "What does a “!” next to a file mean?",
    answer:
      "That file missed a limit, usually the KB range. Use “Fine-tune” to open it on the exam's own page, where you can adjust the crop and settings.",
  },
  {
    question: "Does the kit make thumb impressions or declarations?",
    answer: "Not yet: it makes photos and signatures. Forms that need more, such as AFCAT or Indian Bank, are flagged with a link to their page.",
  },
  {
    question: "Are my photo and signature uploaded?",
    answer: "No. Every file is made by your browser, on your device. Nothing is sent to a server.",
  },
];

export default function AllExamPhotoSignaturePage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="All Exam Photo Resizer: Photo and Signature in One ZIP"
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How the all exam photo and signature resizer works</h2>
          <ol>
            <li>Add your photo and your signature, and frame each one once.</li>
            <li>Tick every form you&apos;re filling; for exams with several notices, pick yours.</li>
            <li>
              Select <strong>Make all files</strong>: each one gets that form&apos;s own pixel size, KB range and DPI, then
              download them together as a ZIP.
            </li>
          </ol>

          <h2>Forms in the kit</h2>
          <p>Each size comes from the official notice shown on the exam&apos;s own page:</p>
          <ul>
            {KIT_GROUPS.map((group) => (
              <li key={group}>
                <strong>{group}:</strong>{" "}
                {exams
                  .filter((e) => e.group === group)
                  .map((e, i, list) => (
                    <span key={e.id}>
                      <Link href={e.path}>{e.name}</Link>
                      {i < list.length - 1 ? ", " : ""}
                    </span>
                  ))}
              </li>
            ))}
          </ul>

          <PrivacyNote>
            <p>Your photo and signature are processed in your browser and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <ExamKitTool exams={exams} />
    </ToolPageShell>
  );
}
