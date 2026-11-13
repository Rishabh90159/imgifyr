import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr 600×600 Photo tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "600×600 Photo",
    subtitle: "2 × 2 inch photo at 300 DPI.",
  });
}
