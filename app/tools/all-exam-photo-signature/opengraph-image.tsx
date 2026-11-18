import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr all exam photo and signature resizer";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "All Exam Photo & Signature Resizer",
    subtitle: "One photo, every form: SSC, RRB, IBPS, NEET, PAN and more in one ZIP.",
  });
}
