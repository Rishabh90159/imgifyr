import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr 30KB Signature tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "30KB Signature",
    subtitle: "A sharper signature up to 30 KB.",
  });
}
