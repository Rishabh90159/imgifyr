import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr KCET photo and signature tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "KCET Photo & Signature Size",
    subtitle: "Photo and signature as JPGs, each under 50 KB.",
  });
}
