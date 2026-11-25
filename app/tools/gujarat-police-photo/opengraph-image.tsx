import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr Gujarat Police photo and signature tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Gujarat Police Photo & Signature",
    subtitle: "OJAS: photo 5 × 3.6 cm, signature 2.5 × 7.5 cm, under 15 KB.",
  });
}
