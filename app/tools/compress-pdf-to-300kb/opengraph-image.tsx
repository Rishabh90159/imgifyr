import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr: compress PDF to 300KB";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Compress PDF to 300KB",
    subtitle: "Bring a PDF under 300 KB for job, admission and scholarship forms. Free, in your browser.",
  });
}
