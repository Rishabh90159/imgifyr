import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr India Post GDS photo and signature tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "India Post GDS Photo & Signature",
    subtitle: "Photo 320 × 400, 30–100 KB; signature 300 × 120, 20–100 KB.",
  });
}
