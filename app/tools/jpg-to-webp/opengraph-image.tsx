import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr JPG to WebP converter";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "JPG to WebP Converter",
    subtitle: "Convert JPG and PNG to smaller WebP files for faster websites.",
  });
}
