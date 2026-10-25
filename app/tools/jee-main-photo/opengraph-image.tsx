import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr JEE Main photo and signature tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "JEE Main Photo & Signature",
    subtitle: "Photo 10–200 KB, signature 10–100 KB, JPG.",
  });
}
