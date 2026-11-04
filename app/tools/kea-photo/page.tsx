import type { Metadata } from "next";
import Link from "next/link";
import { RequirementSummary } from "@/components/requirements/requirement-summary";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { RequirementPhotoTool } from "@/components/tools/requirement-photo-tool";
import { APPLICATIONS } from "@/lib/requirements/applications";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("kea-photo");
const app = APPLICATIONS.kea;

const description =
  "KEA FDA and SDA 2026 ask for a white-background photo of 50–200 KB and a black-pen signature of 50–70 KB, both JPEG. Make both files here, free.";

export const metadata: Metadata = pageMetadata({
  title: "KEA FDA SDA Photo & Signature Size 2026 – Resizer",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the KEA FDA SDA 2026 photo size?",
    answer:
      "A recent passport-size photo in JPEG format on a white background, with a file size between 50 KB and 200 KB. The notice gives no pixel size.",
  },
  {
    question: "What is the KEA signature size?",
    answer:
      "A JPEG between 50 KB and 70 KB. Sign on white paper with a black sketch or marker pen, then scan or photograph it.",
  },
  {
    question: "Why is my KEA signature under 50 KB?",
    answer:
      "A tightly cropped signature compresses very well. Crop with more white margin or use a higher-resolution scan, then create the file again.",
  },
  {
    question: "What happens if I don't upload the photo and signature?",
    answer: "The KEA notice says applications without the photograph and signature are rejected.",
  },
  {
    question: "Which posts does this cover?",
    answer:
      "The 2026 Group-C First Division Assistant, Second Division Assistant and equivalent posts, in both the Residual Parent Cadre and Kalyana Karnataka notices: 5,431 posts.",
  },
];

export default function KeaPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="KEA FDA and SDA 2026 Photo and Signature Size"
      intro={
        <p>
          Make the photo and signature for the Karnataka FDA/SDA 2026 application. Not affiliated with the Karnataka
          Examinations Authority.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Make your KEA files</h2>
          <ol>
            <li>
              <strong>Photograph:</strong> a recent passport-size photo against a plain white wall. If the background
              isn&apos;t white, use the <Link href="/tools/white-background-photo">white background tool</Link> first.
            </li>
            <li>
              <strong>Signature:</strong> black sketch or marker pen on white paper, cropped with a little margin.
            </li>
          </ol>
          <p>The tool saves JPEG files inside the 50–200 KB and 50–70 KB ranges.</p>

          <h2>Application dates</h2>
          <p>
            Apply online from 30 October to 25 November 2026; the fee can be paid until 26 November. Details can&apos;t be
            changed after you submit.
          </p>

          <PrivacyNote>
            <p>Both KEA images are processed in your browser and never uploaded here.</p>
          </PrivacyNote>
        </>
      }
    >
      <div className="space-y-6">
        <RequirementSummary heading="KEA FDA/SDA Photo and Signature Size at a Glance" app={app} />
        <RequirementPhotoTool tool="kea-photo" sets={app.sets} setLabel="KEA notification" appName="KEA" />
      </div>
    </ToolPageShell>
  );
}
