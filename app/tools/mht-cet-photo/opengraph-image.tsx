import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr MHT CET photo tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "MHT CET Photo Size",
    subtitle: "Square 2 × 2 inch, face 80%, 100 KB to 5 MB.",
  });
}
