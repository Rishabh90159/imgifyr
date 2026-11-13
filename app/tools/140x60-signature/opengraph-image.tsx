import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr 140×60 Signature tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "140×60 Signature",
    subtitle: "Under 20 KB, white background.",
  });
}
