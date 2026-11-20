import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr: compress PDF to 200KB";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Compress PDF to 200KB",
    subtitle: "Bring certificates, mark sheets and ID proofs down to a 200 KB upload limit. Free, in your browser.",
  });
}
