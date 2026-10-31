import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr resize image in cm tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Resize Image in CM",
    subtitle: "Exact print size in cm, mm or inches, at any DPI.",
  });
}
