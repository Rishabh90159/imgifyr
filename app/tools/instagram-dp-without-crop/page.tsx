import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { DpMakerTool } from "@/components/tools/whatsapp-dp-tool";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("instagram-dp-without-crop");

const description =
  "Instagram DP size converter: turn a tall or wide photo into a square 1080 × 1080 profile picture without cropping, with a blurred or plain background. Free.";

export const metadata: Metadata = pageMetadata({
  title: "Instagram DP Size Converter – Profile Picture Without Crop",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What size should an Instagram DP be?",
    answer:
      "Square. Instagram crops your profile picture to a square and shows it as a small circle, so a sharp square image is the safest choice. This converter saves 1080 × 1080.",
  },
  {
    question: "Why is my Instagram profile picture cut off?",
    answer:
      "The circle trims a tall or wide photo, and even the corners of a square one. Fit it Inside the circle here and your full photo stays visible.",
  },
  {
    question: "Can I use a group photo or a full-length shot?",
    answer: "Yes. The whole picture is kept and the empty space is filled with a blurred copy or a colour, so nobody is cut out.",
  },
  {
    question: "Is this for Instagram posts too?",
    answer:
      "No, this is for the round profile picture. For square, portrait or Story posts without cropping, use the Instagram image resizer.",
  },
  {
    question: "Is my photo uploaded to a server?",
    answer: "No. The profile picture is made in your browser, on your phone or computer.",
  },
];

export default function InstagramDpPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="Instagram DP Size Converter (No Crop)"
      intro={<p>Make a square Instagram profile picture that shows your whole photo inside the circle.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>Change your Instagram profile picture</h2>
          <ol>
            <li>Add a photo above, choose a blurred or plain background and fit it in the square or inside the circle.</li>
            <li>Download the 1080 × 1080 JPG.</li>
            <li>
              In Instagram, open your profile, tap <strong>Edit profile</strong>, then <strong>Edit picture</strong>, and pick
              the saved image. Leave it unzoomed, since it is already square.
            </li>
          </ol>

          <h2>Profile picture vs posts</h2>
          <p>
            The profile picture is a circle; posts are squares, portraits (4:5) or Stories (9:16). To post a photo without
            cropping, use the <Link href="/tools/instagram-image-resizer">Instagram image resizer</Link>. The same full-photo
            DP also works on <Link href="/tools/whatsapp-dp-without-crop">WhatsApp</Link>.
          </p>

          <PrivacyNote>
            <p>Your photo stays on your device while the profile picture is made.</p>
          </PrivacyNote>
        </>
      }
    >
      <DpMakerTool app="Instagram" />
    </ToolPageShell>
  );
}
