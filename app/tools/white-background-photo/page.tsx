import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundRemoverTool } from "@/components/tools/background-remover-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("white-background-photo");

const description =
  "Make a white background photo in seconds: change photo background to white automatically, or to blue or any colour, and save a JPG. Free, no sign-up, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "White Background Photo – Change Photo Background to White",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I change a photo background to white?",
    answer:
      "Drop your photo. The person is detected and everything behind them becomes plain white straight away. Compare with the slider, then download the JPG.",
  },
  {
    question: "Can I use another colour, like light blue?",
    answer:
      "Yes. Choose Colour under New background and pick any shade, such as the light blue or off-white some forms ask for. Transparent gives a PNG cut-out instead.",
  },
  {
    question: "Will this work for an exam or ID photo?",
    answer:
      "Forms that want a plain white or light background usually accept it. Passport offices may not: the UK, for one, rejects digitally altered photos, so read your form's rules first.",
  },
  {
    question: "Why do hair or shoulders look cut off?",
    answer:
      "The model runs on your device, so it's small. Switch Edges to Crisp or Soft and try again, use a sharper photo, or stand away from a busy background next time.",
  },
  {
    question: "Is my photo uploaded?",
    answer:
      "No. The model downloads from this site once (about 19 MB, then cached) and runs in your browser. Your photo never leaves your device.",
  },
];

export default function WhiteBackgroundPhotoPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="White Background Photo Maker"
      intro={
        <p>
          Replace a cluttered or coloured background with plain white, the background most application and ID photos ask for,
          then save it as a JPG.
        </p>
      }
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Change photo background to white online</h2>
          <ol>
            <li>Take the photo facing the camera, in even light, with space around your head and shoulders.</li>
            <li>Drop it here: the background turns white automatically.</li>
            <li>Check the edges with the slider and download the JPG.</li>
          </ol>

          <h2>Make it ready for your form</h2>
          <p>
            After whitening, crop and size it with the <Link href="/tools/passport-photo-resizer">passport photo resizer</Link>,{" "}
            add a caption with <Link href="/tools/add-name-and-date-on-photo">name and date on photo</Link>, or meet a file
            limit with <Link href="/tools/resize-image-to-kb">resize image to KB</Link>. For products or logos with a
            transparent result, use the <Link href="/tools/background-remover">background remover</Link>.
          </p>

          <h2>White background photo editor without a watermark</h2>
          <p>
            There&apos;s no account, credit limit or watermark, and the result keeps your photo&apos;s full resolution. Shadows
            on the wall behind you are removed with the background, which makes this cleaner than brightening the photo.
          </p>

          <PrivacyNote>
            <p>The model and your photo stay in your browser; nothing is uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <BackgroundRemoverTool tool="white-background-photo" initialBackdrop="white" initialOutput="image/jpeg" />
    </ToolPageShell>
  );
}
