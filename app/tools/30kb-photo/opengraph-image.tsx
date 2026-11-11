import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr 30KB Photo tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "30KB Photo",
    subtitle: "Get a photo or signature under 30 KB.",
  });
}
