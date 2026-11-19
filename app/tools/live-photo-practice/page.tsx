import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { LivePhotoPracticeTool, type LiveExam } from "@/components/tools/live-photo-practice-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { shortNoticeName } from "@/lib/requirements/kit";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("live-photo-practice");

const description =
  "Practise the live photo capture for SSC, RRB, UP Police and AFCAT: your camera checks light, background, blur and framing as you move. Nothing is recorded.";

export const metadata: Metadata = pageMetadata({
  title: "Live Photo Capture Practice – SSC, RRB & UP Police, Free",
  description,
  path: tool.path,
});

// Every notice whose form captures a live photo, with the rules it states.
const exams: LiveExam[] = Object.values(APPLICATIONS).flatMap((app) =>
  app.sets
    .filter((s) => s.livePhotoCapture)
    .map((s) => {
      const own = s.name.startsWith(app.name);
      return {
        id: s.id,
        name: own ? s.name : `${app.name}: ${s.name}`,
        label: own ? shortNoticeName(s.name) : `${app.name}: ${shortNoticeName(s.name)}`,
        rules: s.livePhotoCapture!.rules,
      };
    }),
);
const appNames = [...new Set(Object.values(APPLICATIONS).filter((a) => a.sets.some((s) => s.livePhotoCapture)).map((a) => a.name))];

const faqs: FaqItem[] = [
  {
    question: "What is live photo capture in the SSC form?",
    answer:
      "SSC's application module takes your photo with the camera when prompted, so no ready photo is uploaded. Capturing a photo of an existing photograph gets the application rejected.",
  },
  {
    question: "Can I wear glasses in the SSC live photo?",
    answer: "No. SSC's instructions say not to wear a cap, mask or glasses. Look straight at the camera, at eye level, with your face inside the marked area.",
  },
  {
    question: "Which forms use live photo capture?",
    answer: `Among the forms on this site: ${appNames.join(", ")}. Pick yours above to see its exact rules.`,
  },
  {
    question: "The camera doesn't start. What can I do?",
    answer:
      "Allow the camera when the browser asks (or via the camera icon in the address bar), and close apps like Zoom or WhatsApp that may be using it.",
  },
  {
    question: "Is my camera video recorded or uploaded?",
    answer: "No. The checks run on your device a few times a second and nothing is stored. A practice photo is saved only if you take and download one.",
  },
];

export default function LivePhotoPracticePage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Live Photo Capture Practice for SSC and Other Forms"
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to pass the live photo capture</h2>
          <ol>
            <li>Sit facing a window or lamp, in front of a plain light wall, with the camera at eye level.</li>
            <li>Start the camera for live photo practice and adjust until every check shows ✓ and the box turns green.</li>
            <li>Remove what your form forbids (for SSC: cap, mask and glasses), then fill the real form in the same place.</li>
          </ol>
          <p>
            Already have a photo file for another form? Check it with the <Link href="/tools/exam-photo-checker">exam photo
            checker</Link>.
          </p>

          <PrivacyNote>
            <p>The camera picture is checked on your device and never recorded or uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <LivePhotoPracticeTool exams={exams} />
    </ToolPageShell>
  );
}
