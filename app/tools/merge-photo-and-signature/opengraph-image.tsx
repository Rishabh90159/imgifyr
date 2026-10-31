import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr photo and signature joiner";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Merge Photo and Signature",
    subtitle: "Your photo and signature in one JPG, under any KB limit.",
  });
}
