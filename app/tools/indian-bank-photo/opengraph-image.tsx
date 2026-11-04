import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr Indian Bank Apprentice photo, signature, thumb and declaration tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Indian Bank Apprentice Photo & Signature",
    subtitle: "Photo, signature, thumb impression and declaration.",
  });
}
