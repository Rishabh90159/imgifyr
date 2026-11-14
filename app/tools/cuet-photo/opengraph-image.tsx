import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr CUET photo and signature tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "CUET Photo & Signature Size",
    subtitle: "Photo 10–200 KB (80% face), signature 10–50 KB, JPG.",
  });
}
