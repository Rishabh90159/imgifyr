import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr: compress PDF to 2MB";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Compress PDF to 2MB",
    subtitle: "Reduce long scans and reports to 2 MB or less. Free, in your browser.",
  });
}
