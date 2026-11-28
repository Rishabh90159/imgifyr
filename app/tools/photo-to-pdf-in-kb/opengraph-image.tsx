import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr: photo to PDF in KB";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Photo to PDF in KB",
    subtitle: "Make a PDF of 100, 150, 200 or 300 KB from photos for upload forms.",
  });
}
