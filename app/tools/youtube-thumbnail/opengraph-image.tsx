import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr YouTube thumbnail size maker";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "YouTube Thumbnail Size Maker",
    subtitle: "3840 × 2160 videos or 2160 × 3840 Shorts, under 2 MB, without cropping. Free.",
  });
}
