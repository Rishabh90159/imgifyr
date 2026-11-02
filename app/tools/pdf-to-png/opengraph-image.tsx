import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr PDF to PNG converter";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "PDF to PNG Converter",
    subtitle: "Save every PDF page as a sharp PNG image.",
  });
}
