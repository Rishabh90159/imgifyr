import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr DPI converter";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Change Image DPI",
    subtitle: "Set 300, 200 or any DPI without losing quality.",
  });
}
