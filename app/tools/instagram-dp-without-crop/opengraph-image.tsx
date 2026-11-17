import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr Instagram DP size converter";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Instagram DP Size Converter",
    subtitle: "Your whole photo in the round profile picture, nothing cut off.",
  });
}
