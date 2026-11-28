import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr: compress PDF to 50KB";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Compress PDF to 50KB",
    subtitle: "Shrink a one-page certificate or ID scan below 50 KB. Free, in your browser.",
  });
}
