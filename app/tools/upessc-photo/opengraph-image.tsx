import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr UPESSC photo, signature and declaration tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "UPESSC (UP TGT) Photo & Signature",
    subtitle: "Photo, signature and declaration, 10–100 KB each.",
  });
}
