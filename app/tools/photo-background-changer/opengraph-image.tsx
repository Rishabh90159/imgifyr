import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr photo background changer";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Photo Background Changer",
    subtitle: "Blue, white, red or any colour, in seconds.",
  });
}
