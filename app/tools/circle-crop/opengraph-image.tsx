import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr circle crop tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Circle Crop Image",
    subtitle: "Crop a photo or logo into a circle, as a transparent PNG or a JPG.",
  });
}
