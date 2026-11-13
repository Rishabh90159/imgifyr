import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr Driving Licence Photo tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Driving Licence Photo",
    subtitle: "Sarathi: 420 × 525 px photo, 256 × 64 px signature.",
  });
}
