import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr 20KB Signature tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "20KB Signature",
    subtitle: "10–20 KB signature for exam forms.",
  });
}
