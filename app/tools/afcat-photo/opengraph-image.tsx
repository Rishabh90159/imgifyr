import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr AFCAT photo, signature and thumb impression tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "AFCAT Photo, Signature & Thumb",
    subtitle: "Photo 100–200 KB, signature 80–150 KB, thumb 50–100 KB.",
  });
}
