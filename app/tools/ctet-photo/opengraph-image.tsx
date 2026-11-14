import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr CTET photo and signature tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "CTET Photo & Signature Size",
    subtitle: "Photo 3.5 × 4.5 cm, 10–100 KB; signature 3–30 KB.",
  });
}
