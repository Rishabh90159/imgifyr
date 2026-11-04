import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr KEA FDA and SDA photo and signature tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "KEA FDA & SDA Photo & Signature",
    subtitle: "Photo 50–200 KB and signature 50–70 KB, JPEG.",
  });
}
