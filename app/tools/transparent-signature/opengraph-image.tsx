import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr transparent signature maker";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Transparent Signature Maker",
    subtitle: "Remove the paper from your signature and save a see-through PNG.",
  });
}
