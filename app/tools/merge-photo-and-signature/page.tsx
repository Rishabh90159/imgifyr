import type { Metadata } from "next";
import Link from "next/link";
import { PhotoSignatureTool } from "@/components/tools/photo-signature-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("merge-photo-and-signature");

const description =
  "Merge photo and signature into one JPG: signature below or beside the photo, paper cleaned to white, under a KB limit you set. Free photo signature joiner, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Merge Photo and Signature – Photo Signature Joiner Online",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I put my photo and signature in one image?",
    answer:
      "Add your photo, then your signature. Choose Below or Beside, set a width or KB limit if your form gives one, and select Join. You get a single JPG to upload.",
  },
  {
    question: "Will my signature be stretched?",
    answer:
      "No. It's scaled to the photo's width (or height when placed beside it) in proportion. A signature photographed on grey paper is cleaned to a white background first, which you can switch off.",
  },
  {
    question: "Can I keep the joined image under 50 KB or 100 KB?",
    answer:
      "Yes. Type the limit under Max file size. The tool lowers JPG quality first and reduces the dimensions only if it has to, unless you fixed the width.",
  },
  {
    question: "Which forms ask for a photo and signature together?",
    answer:
      "Some admission, scholarship and recruitment forms have a single upload for both. If yours has separate fields, upload them separately instead, using the signature resizer for the signature.",
  },
  {
    question: "Are my photo and signature uploaded?",
    answer: "No. Both images are combined by your browser, on your device. Nothing is sent to a server.",
  },
];

export default function MergePhotoAndSignaturePage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Merge Photo and Signature into One Image"
      intro={
        <p>
          This photo and signature joiner places your signature under or next to your photo and saves one JPG, sized for the
          form you&apos;re filling in.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Join photo and signature in three steps</h2>
          <ol>
            <li>Drop your passport-style photo, then a photo or scan of your signature.</li>
            <li>Pick where the signature goes and how much white space separates them.</li>
            <li>Enter the width or maximum KB your form states, select Join, then download.</li>
          </ol>

          <h2>Getting the signature right</h2>
          <p>
            Sign in black or dark blue ink on plain white paper and photograph it in daylight. Crop it tightly with the{" "}
            <Link href="/tools/signature-resizer">signature resizer</Link> first so there&apos;s little empty paper around it;
            a tight crop makes the signature larger and clearer in the joined image.
          </p>

          <h2>Sizes and file limits</h2>
          <p>
            Leave the width empty to keep the photo&apos;s resolution, or type the pixel width your form wants; the height
            follows. With a KB limit, the result is compressed once, as a JPG. For a photo on its own, use{" "}
            <Link href="/tools/resize-image-to-kb">resize image to KB</Link>; for more than two pictures, use{" "}
            <Link href="/tools/merge-images">merge images</Link>.
          </p>

          <PrivacyNote>
            <p>Your photo and signature are joined on your device and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <PhotoSignatureTool />
    </ToolPageShell>
  );
}
