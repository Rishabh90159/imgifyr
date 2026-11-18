import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr PAN card photo and signature tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "PAN Card Photo & Signature Size",
    subtitle: "Photo under 20 KB, signature under 10 KB, at 200 DPI.",
  });
}
