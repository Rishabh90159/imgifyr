import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr WebP to PNG converter";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "WebP to PNG Converter",
    subtitle: "Turn WebP images into lossless PNGs that keep transparency.",
  });
}
