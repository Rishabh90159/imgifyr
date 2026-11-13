import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr Voter ID Photo tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Voter ID Photo",
    subtitle: "Form 6: 4.5 × 3.5 cm, white background.",
  });
}
