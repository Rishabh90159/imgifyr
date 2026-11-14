import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr UP Police photo and signature tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "UP Police Photo & Signature",
    subtitle: "Live photo rules; signature 30–50 KB, 140 × 60 px.",
  });
}
