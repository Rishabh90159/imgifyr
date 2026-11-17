import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { DpMakerTool } from "@/components/tools/whatsapp-dp-tool";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("telegram-dp-without-crop");

const description =
  "Telegram DP size converter: fit any photo into a round Telegram profile picture without losing the edges. Blurred or coloured background, 1080 × 1080, free.";

export const metadata: Metadata = pageMetadata({
  title: "Telegram DP Size Converter – Full Photo, No Crop, Free",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the Telegram DP size?",
    answer:
      "Telegram profile photos are square and appear as circles in chats and contacts. A sharp square picture looks best; this converter creates one at 1080 × 1080.",
  },
  {
    question: "How do I stop Telegram from cutting my photo?",
    answer:
      "Make the photo square before you set it. Choose Inside the circle and your whole picture fits inside the round frame Telegram shows.",
  },
  {
    question: "Does it work for a Telegram group or channel photo?",
    answer: "Yes. Groups and channels also use a round picture, so the same square works for them.",
  },
  {
    question: "Can I add more than one profile photo?",
    answer: "Telegram keeps several profile photos that others can swipe through. Make each one here so none of them is cropped.",
  },
  {
    question: "Does the photo leave my device?",
    answer: "No. The converter runs in your browser and nothing is uploaded.",
  },
];

export default function TelegramDpPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Telegram DP Size Converter (No Crop)"
      intro={<p>Fit your whole photo into a round Telegram profile picture, with no edges lost.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Set it as your Telegram photo</h2>
          <ol>
            <li>Add your picture above and pick a background; Inside the circle keeps every corner visible.</li>
            <li>Save the square JPG.</li>
            <li>
              In Telegram, open <strong>Settings</strong>, tap <strong>Set Profile Photo</strong> (or the camera icon) and choose
              the saved image. It already fills the frame, so confirm it as it is.
            </li>
          </ol>

          <h2>Groups, channels and other apps</h2>
          <p>
            Admins can use the same square for a group or channel picture. For other apps, try the{" "}
            <Link href="/tools/whatsapp-dp-without-crop">WhatsApp DP</Link> or{" "}
            <Link href="/tools/instagram-dp-without-crop">Instagram DP</Link> pages, or the{" "}
            <Link href="/tools/circle-crop">circle crop</Link> tool for a round PNG.
          </p>

          <PrivacyNote>
            <p>Your picture is processed on your device and never sent to us.</p>
          </PrivacyNote>
        </>
      }
    >
      <DpMakerTool app="Telegram" />
    </ToolPageShell>
  );
}
