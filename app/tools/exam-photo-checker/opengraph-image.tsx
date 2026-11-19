import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr exam photo checker";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Exam Photo Checker",
    subtitle: "Will your photo or signature be rejected? Check type, pixels, KB, light and background.",
  });
}
