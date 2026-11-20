import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr: compress PDF to 100KB";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Compress PDF to 100KB",
    subtitle: "Compress a PDF to 100 KB or less for forms with a tight limit, such as single certificates. Free, in your browser.",
  });
}
