import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr HEIC to PNG converter";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "HEIC to PNG Converter",
    subtitle: "Convert iPhone HEIC photos to lossless PNG files.",
  });
}
