import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr online document scanner";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Document Scanner Online",
    subtitle: "Phone photo to a straight, clean scanned PDF, even under 200 KB. Free, nothing uploaded.",
  });
}
