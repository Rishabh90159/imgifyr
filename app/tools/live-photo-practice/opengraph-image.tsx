import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr live photo capture practice";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Live Photo Capture Practice",
    subtitle: "Check light, background and framing with your camera before the SSC, RRB or UP Police form.",
  });
}
