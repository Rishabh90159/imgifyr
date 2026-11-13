import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr Thumb Impression tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Thumb Impression",
    subtitle: "240 × 240 px, 20–50 KB.",
  });
}
