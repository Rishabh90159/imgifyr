import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr UKSSSC photo, signature and thumb impression tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "UKSSSC Signature & Thumb",
    subtitle: "Live photo rules; signature and thumb 150 × 100 px JPG.",
  });
}
