import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { WhatsappDpTool } from "@/components/tools/whatsapp-dp-tool";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("whatsapp-dp-without-crop");

const description =
  "Set your full photo as your WhatsApp DP without cropping: fit it into a square with a blurred or coloured background, even inside the round view. Free, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "WhatsApp DP Without Crop – Full Size DP Maker, Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the WhatsApp DP size?",
    answer:
      "WhatsApp doesn't publish an official pixel size. It crops your profile photo to a square and shows it as a circle, so a sharp square image works best. This tool makes 1080 × 1080.",
  },
  {
    question: "Why does WhatsApp cut my photo?",
    answer:
      "A tall or wide photo doesn't fit its square, so it cuts the sides. Even a square photo loses its corners in the round view. Choose Inside the circle to keep everything visible.",
  },
  {
    question: "Which background looks best?",
    answer: "Blurred photo blends the edges with your own picture. White, black or a colour gives a clean frame, like a poster.",
  },
  {
    question: "Will my DP lose quality?",
    answer:
      "WhatsApp compresses profile photos when you upload them. Starting from a sharp 1080 × 1080 image keeps as much detail as possible.",
  },
  {
    question: "Can I use it for Instagram or Telegram DP?",
    answer: "Yes. Both show profile photos as a circle, so the same square works. For Instagram posts, use the Instagram resizer.",
  },
  {
    question: "Is my photo uploaded?",
    answer: "No. The DP is made by your browser, on your device; your photo is never sent anywhere.",
  },
];

export default function WhatsappDpPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="WhatsApp DP Without Crop"
      intro={<p>Fit your whole photo into a full-size WhatsApp DP, so nothing gets cut off.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to set a full DP on WhatsApp</h2>
          <ol>
            <li>Add your photo above, pick a background, and choose whether the whole photo fits the square or the circle.</li>
            <li>Create the DP and download the 1080 × 1080 JPG.</li>
            <li>
              In WhatsApp, open <strong>Settings</strong>, tap your profile photo, then the camera icon (Android) or{" "}
              <strong>Edit</strong> (iPhone), and choose the downloaded image. It is already square, so tap{" "}
              <strong>Done</strong> without zooming.
            </li>
          </ol>

          <h2>Square or circle?</h2>
          <p>
            WhatsApp shows your DP as a circle, which hides the corners of the square. <strong>In the square</strong> gives the
            biggest photo; <strong>Inside the circle</strong> makes it a little smaller so even its corners show. For a round
            PNG of just your face, try the <Link href="/tools/circle-crop">circle crop</Link> tool.
          </p>

          <PrivacyNote>
            <p>Your photo is processed in your browser and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <WhatsappDpTool />
    </ToolPageShell>
  );
}
