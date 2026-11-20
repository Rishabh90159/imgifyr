import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr: compress PDF to 1MB";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Compress PDF to 1MB",
    subtitle: "Reduce a large PDF or phone scan to under 1 MB for portals and email. Free, in your browser.",
  });
}
