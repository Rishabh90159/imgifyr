import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr Indian visa photo maker";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Indian Visa Photo Size",
    subtitle: "Square JPEG, 350 × 350 to 1000 × 1000 pixels, 10–300 KB, from the official visa site.",
  });
}
