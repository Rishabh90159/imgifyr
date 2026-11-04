import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr Central Railway apprentice photo and signature tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Railway Apprentice Photo & Signature",
    subtitle: "3.5 × 3.5 cm at 100 DPI: photo 20–70 KB, signature 20–30 KB.",
  });
}
