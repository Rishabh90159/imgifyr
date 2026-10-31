import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr white background photo maker";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "White Background Photo",
    subtitle: "Change your photo background to white in seconds.",
  });
}
