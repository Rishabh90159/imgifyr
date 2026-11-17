import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr WhatsApp DP without crop tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "WhatsApp DP Without Crop",
    subtitle: "Your whole photo as a full-size DP, nothing cut off.",
  });
}
