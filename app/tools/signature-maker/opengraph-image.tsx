import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr online signature maker";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Online Signature Maker",
    subtitle: "Draw or type your signature. Save a transparent PNG or a JPG.",
  });
}
