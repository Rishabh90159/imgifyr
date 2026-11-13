import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr 413×531 Photo tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "413×531 Photo",
    subtitle: "3.5 × 4.5 cm passport size at 300 DPI.",
  });
}
