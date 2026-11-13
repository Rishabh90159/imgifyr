import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr 630×810 Photo tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "630×810 Photo",
    subtitle: "Exact pixels, optional KB limit.",
  });
}
