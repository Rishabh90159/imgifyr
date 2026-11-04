import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr tool to put the front and back of an Aadhaar or ID card in one page";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Aadhaar Front & Back in One Page",
    subtitle: "One A4 PDF at card size, or one JPG under a KB limit.",
  });
}
