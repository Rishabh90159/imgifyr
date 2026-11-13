import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr 200×230 Photo tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "200×230 Photo",
    subtitle: "Bank exam photo: 20–50 KB JPG.",
  });
}
