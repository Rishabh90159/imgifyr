import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr 10KB Photo tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "10KB Photo",
    subtitle: "Compress a signature or photo to 10 KB.",
  });
}
