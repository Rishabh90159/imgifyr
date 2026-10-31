import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Imgifyr name and date on photo tool";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    title: "Name and Date on Photo",
    subtitle: "Print your name and photo date below it. Kerala PSC ready.",
  });
}
