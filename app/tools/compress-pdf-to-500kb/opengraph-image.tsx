import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr: compress PDF to 500KB";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Compress PDF to 500KB",
    subtitle: "Fit resumes, reports and multi-page documents under 500 KB. Free, in your browser.",
  });
}
