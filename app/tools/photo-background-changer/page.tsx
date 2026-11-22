import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundRemoverTool } from "@/components/tools/background-remover-tool";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("photo-background-changer");

const description =
  "Photo background change online, free: swap the background for blue, white, red, grey or any colour automatically and save a JPG. No sign-up, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "Photo Background Change Online – Blue, White, Any Colour",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "How do I change a photo background?",
    answer: "Add your photo and tap a colour. You are cut out automatically and set on the new colour; tap another colour and Apply changes to try it.",
  },
  {
    question: "Can I make a blue background photo for a passport size photo?",
    answer:
      "Yes. Pick Light blue or Blue, then crop with the passport photo resizer. Check your form first: Indian passport and most exam forms want a white or light background.",
  },
  {
    question: "Can I pick an exact colour?",
    answer: "Yes. Tap Custom and choose any shade; the colour code is shown so you can match the one your form or office asks for.",
  },
  {
    question: "The outline around my hair looks rough. What can I do?",
    answer: "Try the other Edges option, use a sharper photo, or retake it against a plain wall with some space around your head.",
  },
  {
    question: "Is it free, and is my photo uploaded?",
    answer: "Free, with no watermark or sign-up. The cut-out happens on your phone or computer; only the small model file comes from this site, once.",
  },
];

export default function PhotoBackgroundChangerPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Photo Background Changer"
      intro={<p>Change the background of a photo to blue, white, red, grey or any colour you choose, then save it as a JPG.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Change photo background in three steps</h2>
          <ol>
            <li>Add a photo where your face and shoulders are clearly visible.</li>
            <li>Tap a ready colour, or Custom for any shade.</li>
            <li>Drag the slider to compare, then save the JPG.</li>
          </ol>

          <h2>Blue background photo or white?</h2>
          <p>
            Many school, office ID and some visa forms ask for a blue or red background, while passports and most exam forms
            want white. For white, the <Link href="/tools/white-background-photo">white background photo maker</Link> starts
            there directly; for a transparent cut-out, use the <Link href="/tools/background-remover">background remover</Link>.
          </p>

          <h2>Next: size it for the form</h2>
          <p>
            Most forms also set a size. Cut it to passport shape with the{" "}
            <Link href="/tools/passport-photo-resizer">passport photo resizer</Link>, then bring the file under the limit with{" "}
            <Link href="/tools/resize-image-to-kb">resize image to KB</Link>.
          </p>

          <PrivacyNote>
            <p>Your photo is processed on your own device and is never sent anywhere.</p>
          </PrivacyNote>
        </>
      }
    >
      <BackgroundRemoverTool tool="photo-background-changer" initialBackdrop="custom" initialColor="#cfe3f7" initialOutput="image/jpeg" />
    </ToolPageShell>
  );
}
