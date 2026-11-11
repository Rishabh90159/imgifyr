import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr 500KB Image tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "500KB Image",
    subtitle: "Compress a photo or scan to 500 KB.",
  });
}
