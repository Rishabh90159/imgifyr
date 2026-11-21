import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyNote, ToolPageShell } from "@/components/tool-page/tool-page-shell";
import { YoutubeThumbnailTool } from "@/components/tools/youtube-thumbnail-tool";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/schema";
import { getTool } from "@/lib/tools/registry";

const tool = getTool("youtube-thumbnail");

const description =
  "YouTube thumbnail size made easy: turn any image into a 3840 × 2160 (16:9) or Shorts 2160 × 3840 thumbnail under 2 MB, without cropping. Free, no upload.";

export const metadata: Metadata = pageMetadata({
  title: "YouTube Thumbnail Size Maker – 16:9 & Shorts, Under 2MB",
  description,
  path: tool.path,
});

const faqs: FaqItem[] = [
  {
    question: "What is the YouTube thumbnail size?",
    answer:
      "YouTube Help recommends 3840 × 2160 pixels (16:9) for videos, at least 640 pixels wide, as a JPG or PNG. Smaller 16:9 sizes such as 1920 × 1080 or 1280 × 720 keep the same shape, and the tool offers them too.",
  },
  {
    question: "What is the YouTube Shorts thumbnail size?",
    answer: "2160 × 3840 pixels (9:16), at least 640 pixels tall. YouTube currently lets you add custom Shorts thumbnails in YouTube Studio on a computer.",
  },
  {
    question: "What is the maximum thumbnail file size?",
    answer: "2 MB when you upload from a phone and 50 MB from a computer. Every thumbnail made here is under 2 MB, so it works from either.",
  },
  {
    question: "Why can't I upload a custom thumbnail?",
    answer:
      "YouTube allows custom thumbnails only on verified accounts; verify yours at youtube.com/verify. There is also a daily upload limit: if you hit it, try again after 24 hours.",
  },
  {
    question: "How do I make a thumbnail without cropping my image?",
    answer: "Choose Fit the whole image: the full picture is kept and the empty sides get a blurred copy of it or a colour of your choice.",
  },
  {
    question: "Is my image uploaded?",
    answer: "No. The thumbnail is made by your browser on your device; nothing is sent to us.",
  },
];

export default function YoutubeThumbnailPage() {
  return (
    <ToolPageShell
      tool={tool}
      h1="YouTube Thumbnail Size Maker"
      intro={<p>Make a YouTube thumbnail at the right size and shape from any image, for videos or Shorts, under 2 MB.</p>}
      schemaDescription={description}
      faqs={faqs}
      content={
        <>
          <h2>How to make a YouTube thumbnail at the right size</h2>
          <ol>
            <li>Add your image, then choose Video (16:9) or Shorts (9:16) and a size.</li>
            <li>Fit the whole image with a blurred or coloured background, or fill the frame edge to edge.</li>
            <li>Create the thumbnail and download the JPG, then upload it in YouTube Studio.</li>
          </ol>

          <h2>YouTube thumbnail size and rules</h2>
          <p>
            YouTube Help asks for 3840 × 2160 for videos and 2160 × 3840 for Shorts, JPG or PNG, under 2 MB from a phone or 50 MB
            from a computer, and a verified account for custom thumbnails. Need a different shape, such as an Instagram post? Use
            the <Link href="/tools/instagram-image-resizer">Instagram image resizer</Link>, or{" "}
            <Link href="/tools/image-resizer">resize to any size</Link>.
          </p>

          <PrivacyNote>
            <p>Your image is processed in your browser and never uploaded.</p>
          </PrivacyNote>
        </>
      }
    >
      <YoutubeThumbnailTool />
    </ToolPageShell>
  );
}
