/**
 * Registry of every tool on the site. Navigation, homepage cards, related-tool
 * links and the sitemap are all generated from this list, so adding a tool in a
 * later phase means adding one entry here plus its page.
 */
export type ToolId =
  | "image-resizer"
  | "resize-jpg"
  | "resize-png"
  | "resize-webp"
  | "resize-gif"
  | "instagram-image-resizer"
  | "image-compressor"
  | "resize-image-to-kb"
  | "jpg-to-png"
  | "png-to-jpg"
  | "webp-to-jpg"
  | "heic-to-jpg"
  | "svg-to-png"
  | "png-to-svg"
  | "image-cropper"
  | "passport-photo-resizer"
  | "signature-resizer"
  | "bulk-image-resizer"
  | "10kb-photo"
  | "20kb-photo"
  | "30kb-photo"
  | "500kb-photo"
  | "200x230-photo"
  | "413x531-photo"
  | "630x810-photo"
  | "600x600-photo"
  | "140x60-signature"
  | "20kb-signature"
  | "30kb-signature"
  | "thumb-impression-resizer"
  | "50kb-photo"
  | "100kb-photo"
  | "200kb-photo"
  | "ssc-photo"
  | "upsc-photo"
  | "ibps-photo"
  | "sbi-photo"
  | "neet-photo"
  | "passport-photo"
  | "image-upscaler"
  | "background-remover"
  | "photo-to-pdf"
  | "merge-images"
  | "jpeg-to-jpg"
  | "jpg-to-pdf"
  | "image-size-increase"
  | "image-quality-enhancer"
  | "mb-to-kb-converter"
  | "word-to-pdf"
  | "pdf-to-word"
  | "merge-pdf"
  | "compress-pdf"
  | "pdf-to-jpg"
  | "image-to-jpg"
  | "rrb-photo"
  | "upsssc-photo"
  | "dsssb-photo"
  | "jee-main-photo"
  | "upessc-photo"
  | "rrc-apprentice-photo"
  | "indian-bank-photo"
  | "kea-photo"
  | "afcat-photo"
  | "cuet-photo"
  | "ctet-photo"
  | "up-police-photo"
  | "driving-licence-photo"
  | "voter-id-photo"
  | "merge-photo-and-signature"
  | "aadhaar-front-and-back"
  | "add-name-and-date-on-photo"
  | "change-image-dpi"
  | "resize-image-in-cm"
  | "white-background-photo"
  | "transparent-signature"
  | "circle-crop"
  | "jpg-to-webp"
  | "webp-to-png"
  | "heic-to-png"
  | "pdf-to-png";

export type ToolCategory = "resize" | "compress" | "convert" | "edit" | "size" | "application" | "units" | "pdf";

/** Navigation groups: general image tools, format converters, file-size tools, exam/passport photo pages, and PDF/Word document tools. */
export type NavGroup = "image" | "convert" | "size" | "application" | "pdf";

export function navGroupOf(tool: ToolDefinition): NavGroup {
  switch (tool.category) {
    case "convert":
      return "convert";
    case "size":
    case "units":
      return "size";
    case "application":
      return "application";
    case "pdf":
      return "pdf";
    default:
      return "image";
  }
}

/** Hub page for the exam, recruitment and passport photo pages. */
export const APPLICATION_HUB = { name: "Exam & passport photos", path: "/tools/application-photos" } as const;

/** Hub page for the PDF and Word document tools. */
export const PDF_HUB = { name: "PDF tools", path: "/tools/pdf-tools" } as const;

/**
 * Breadcrumb trail for a tool page. Size pages sit under the general "resize
 * image to KB" tool, which owns the broad file-size intent; application pages
 * sit under their comparison hub; tools with a `parent` (the format resizers)
 * sit under it. Other tools sit directly under /tools.
 */
export function breadcrumbTrail(tool: ToolDefinition): { name: string; path: string }[] {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
  ];
  if (tool.category === "size") trail.push({ name: tools["resize-image-to-kb"].name, path: tools["resize-image-to-kb"].path });
  if (tool.category === "application") trail.push({ ...APPLICATION_HUB });
  if (tool.category === "pdf") trail.push({ ...PDF_HUB });
  if (tool.parent) trail.push({ name: tools[tool.parent].name, path: tools[tool.parent].path });
  return [...trail, { name: tool.name, path: tool.path }];
}

export interface ToolDefinition {
  id: ToolId;
  path: `/tools/${string}`;
  /** Product name, used in navigation, cards and breadcrumbs. */
  name: string;
  /** Short label for compact navigation. */
  navLabel: string;
  /** One-sentence card description. */
  summary: string;
  /** Descriptive anchor text used when other pages link to this tool. */
  linkText: string;
  category: ToolCategory;
  related: ToolId[];
  /** Broader tool this page specialises (shown in the breadcrumb trail). */
  parent?: ToolId;
  /** ISO date of the last meaningful content or feature change. */
  updated: string;
  /** False keeps a narrow size page out of the header menus (it stays on /tools, in the sitemap and in related links). */
  menu?: false;
}

export const tools: Record<ToolId, ToolDefinition> = {
  "image-resizer": {
    id: "image-resizer",
    path: "/tools/image-resizer",
    name: "Image Resizer",
    navLabel: "Resize",
    summary: "Change width and height in pixels or by percentage, with aspect ratio locked by default.",
    linkText: "Resize an image to new dimensions",
    category: "resize",
    related: ["image-compressor", "50kb-photo", "100kb-photo", "bulk-image-resizer", "image-cropper", "resize-image-in-cm"],
    updated: "2026-10-08",
  },
  "resize-jpg": {
    id: "resize-jpg",
    path: "/tools/resize-jpg",
    name: "Resize JPG",
    navLabel: "Resize JPG",
    summary: "Resize JPG photos by pixels or percentage, with a quality control and an optional print resolution (DPI).",
    linkText: "Resize a JPG image",
    category: "resize",
    parent: "image-resizer",
    related: ["image-compressor", "resize-image-to-kb", "jpg-to-png", "resize-png", "resize-webp", "change-image-dpi"],
    updated: "2026-10-18",
  },
  "resize-png": {
    id: "resize-png",
    path: "/tools/resize-png",
    name: "Resize PNG",
    navLabel: "Resize PNG",
    summary: "Resize PNG images and keep their transparency, with optional colour reduction for a much smaller file.",
    linkText: "Resize a PNG and keep transparency",
    category: "resize",
    parent: "image-resizer",
    related: ["png-to-jpg", "image-compressor", "background-remover", "png-to-svg", "resize-jpg", "resize-webp"],
    updated: "2026-10-18",
  },
  "resize-webp": {
    id: "resize-webp",
    path: "/tools/resize-webp",
    name: "Resize WebP",
    navLabel: "Resize WebP",
    summary: "Resize WebP images and save them as WebP, JPG or PNG, with a warning for animated WebP files.",
    linkText: "Resize a WebP image",
    category: "resize",
    parent: "image-resizer",
    related: ["webp-to-jpg", "image-compressor", "resize-jpg", "resize-png", "resize-image-to-kb", "bulk-image-resizer"],
    updated: "2026-10-08",
  },
  "resize-gif": {
    id: "resize-gif",
    path: "/tools/resize-gif",
    name: "Resize GIF",
    navLabel: "Resize GIF",
    summary: "Resize animated GIFs and keep every frame, the timing and the loop, with smooth or sharp-pixel scaling.",
    linkText: "Resize an animated GIF",
    category: "resize",
    parent: "image-resizer",
    related: ["image-resizer", "resize-png", "merge-images", "image-compressor", "bulk-image-resizer", "image-cropper"],
    updated: "2026-10-08",
  },
  "instagram-image-resizer": {
    id: "instagram-image-resizer",
    path: "/tools/instagram-image-resizer",
    name: "Instagram Image Resizer",
    navLabel: "Instagram",
    summary: "Resize and crop photos for Instagram posts, Stories and Reel covers, or fit the whole photo with a border.",
    linkText: "Resize a photo for Instagram",
    category: "resize",
    parent: "image-resizer",
    related: ["image-resizer", "image-cropper", "circle-crop", "image-compressor", "webp-to-jpg", "heic-to-jpg"],
    updated: "2026-10-10",
  },
  "image-compressor": {
    id: "image-compressor",
    path: "/tools/image-compressor",
    name: "Image Compressor",
    navLabel: "Compress",
    summary: "Reduce the file size of JPG, PNG and WebP images while keeping their dimensions.",
    linkText: "Compress an image",
    category: "compress",
    related: ["image-resizer", "resize-image-to-kb", "100kb-photo", "50kb-photo", "20kb-photo", "png-to-jpg"],
    updated: "2026-10-07",
  },
  "resize-image-to-kb": {
    id: "resize-image-to-kb",
    path: "/tools/resize-image-to-kb",
    name: "Resize Image to Exact KB",
    navLabel: "Resize to KB",
    summary: "Hit a file size limit such as 20 KB, 50 KB, 100 KB or 200 KB for forms and uploads.",
    linkText: "Resize an image to 50KB, 100KB or any size",
    category: "resize",
    related: ["50kb-photo", "100kb-photo", "200kb-photo", "image-compressor", "image-size-increase", "passport-photo-resizer"],
    updated: "2026-10-18",
  },
  "jpg-to-png": {
    id: "jpg-to-png",
    path: "/tools/jpg-to-png",
    name: "JPG to PNG Converter",
    navLabel: "JPG to PNG",
    summary: "Convert JPG and JPEG photos to PNG without adding further compression loss.",
    linkText: "Convert JPG to PNG",
    category: "convert",
    related: ["png-to-jpg", "jpg-to-webp", "heic-to-jpg", "image-resizer", "image-compressor"],
    updated: "2026-10-31",
  },
  "png-to-jpg": {
    id: "png-to-jpg",
    path: "/tools/png-to-jpg",
    name: "PNG to JPG Converter",
    navLabel: "PNG to JPG",
    summary: "Turn PNG images into smaller JPG files, with a background of your choice for transparency.",
    linkText: "Convert PNG to JPG",
    category: "convert",
    related: ["jpg-to-png", "webp-to-jpg", "jpg-to-webp", "image-to-jpg", "image-compressor", "resize-image-to-kb"],
    updated: "2026-10-31",
  },
  "webp-to-jpg": {
    id: "webp-to-jpg",
    path: "/tools/webp-to-jpg",
    name: "WebP to JPG Converter",
    navLabel: "WebP to JPG",
    summary: "Convert WebP images saved from websites into JPG files that every app and upload form accepts.",
    linkText: "Convert WebP to JPG",
    category: "convert",
    related: ["png-to-jpg", "webp-to-png", "image-to-jpg", "image-compressor", "resize-image-to-kb", "image-resizer"],
    updated: "2026-10-31",
  },
  "heic-to-jpg": {
    id: "heic-to-jpg",
    path: "/tools/heic-to-jpg",
    name: "HEIC to JPG Converter",
    navLabel: "HEIC to JPG",
    summary: "Convert iPhone HEIC and HEIF photos to JPG that opens everywhere, right in your browser.",
    linkText: "Convert HEIC photos to JPG",
    category: "convert",
    related: ["image-to-jpg", "heic-to-png", "image-resizer", "image-compressor", "jpg-to-png"],
    updated: "2026-10-31",
  },
  "svg-to-png": {
    id: "svg-to-png",
    path: "/tools/svg-to-png",
    name: "SVG to PNG Converter",
    navLabel: "SVG to PNG",
    summary: "Turn SVG graphics into PNG images at any pixel size, with a transparent or solid background.",
    linkText: "Convert SVG to PNG at any size",
    category: "convert",
    related: ["png-to-svg", "image-resizer", "image-compressor"],
    updated: "2026-10-06",
  },
  "png-to-svg": {
    id: "png-to-svg",
    path: "/tools/png-to-svg",
    name: "PNG to SVG Converter",
    navLabel: "PNG to SVG",
    summary: "Trace logos, icons and simple graphics into real vector SVG paths.",
    linkText: "Vectorize a PNG into SVG",
    category: "convert",
    related: ["svg-to-png", "image-cropper", "circle-crop", "image-compressor"],
    updated: "2026-10-06",
  },
  "image-cropper": {
    id: "image-cropper",
    path: "/tools/image-cropper",
    name: "Image Cropper",
    navLabel: "Crop",
    summary: "Crop photos freely or to 1:1, 4:3, 16:9, 3:2 or a custom ratio, with zoom and rotation.",
    linkText: "Crop an image to any aspect ratio",
    category: "edit",
    related: ["image-resizer", "circle-crop", "image-compressor", "passport-photo-resizer", "signature-resizer", "merge-images"],
    updated: "2026-10-31",
  },
  "passport-photo-resizer": {
    id: "passport-photo-resizer",
    path: "/tools/passport-photo-resizer",
    name: "Passport Photo Resizer",
    navLabel: "Passport photo",
    summary: "Crop and resize a photo to a passport or application size in pixels, millimetres and KB.",
    linkText: "Resize a photo for a passport or visa application",
    category: "edit",
    related: ["passport-photo", "resize-image-in-cm", "signature-resizer", "add-name-and-date-on-photo", "image-cropper", "resize-image-to-kb"],
    updated: "2026-10-07",
  },
  "signature-resizer": {
    id: "signature-resizer",
    path: "/tools/signature-resizer",
    name: "Signature Resizer",
    navLabel: "Signature",
    summary: "Crop, clean up and resize a signature image to the pixel and KB limits of online forms.",
    linkText: "Resize a signature for an online form",
    category: "edit",
    related: ["140x60-signature", "20kb-signature", "transparent-signature", "image-cropper", "resize-image-to-kb", "merge-photo-and-signature"],
    updated: "2026-10-31",
  },
  "bulk-image-resizer": {
    id: "bulk-image-resizer",
    path: "/tools/bulk-image-resizer",
    name: "Bulk Image Resizer",
    navLabel: "Bulk resize",
    summary: "Resize many images at once and download them individually or together as a ZIP.",
    linkText: "Resize multiple images at once",
    category: "resize",
    related: ["image-resizer", "image-compressor", "resize-image-to-kb", "resize-jpg", "heic-to-jpg", "photo-to-pdf"],
    updated: "2026-10-06",
  },
  "10kb-photo": {
    id: "10kb-photo",
    path: "/tools/10kb-photo",
    name: "10KB Photo Resizer",
    navLabel: "10KB photo",
    summary: "Compress a signature, thumb impression or small photo to 10 KB or less.",
    linkText: "Resize an image to 10KB",
    category: "size",
    related: ["20kb-photo", "signature-resizer", "30kb-photo", "resize-image-to-kb"],
    updated: "2026-11-11",
  },
  "20kb-photo": {
    id: "20kb-photo",
    path: "/tools/20kb-photo",
    name: "20KB Photo Resizer",
    navLabel: "20KB photo",
    summary: "Reduce a photo or signature to 20 KB or less, the tightest limit on many application forms.",
    linkText: "Resize a photo to 20KB",
    category: "size",
    related: ["10kb-photo", "30kb-photo", "50kb-photo", "signature-resizer", "resize-image-to-kb", "image-compressor"],
    updated: "2026-10-07",
  },
  "30kb-photo": {
    id: "30kb-photo",
    path: "/tools/30kb-photo",
    name: "30KB Photo Resizer",
    navLabel: "30KB photo",
    summary: "Get a form photo or signature under 30 KB, with the exact size shown before download.",
    linkText: "Resize a photo to 30KB",
    category: "size",
    related: ["20kb-photo", "50kb-photo", "rrb-photo", "signature-resizer", "resize-image-to-kb"],
    updated: "2026-11-11",
  },
  "50kb-photo": {
    id: "50kb-photo",
    path: "/tools/50kb-photo",
    name: "50KB Photo Resizer",
    navLabel: "50KB photo",
    summary: "Get a photo under 50 KB while keeping a face clear and sharp, for recruitment and exam forms.",
    linkText: "Resize a photo to 50KB",
    category: "size",
    related: ["20kb-photo", "100kb-photo", "200kb-photo", "ibps-photo", "resize-image-to-kb"],
    updated: "2026-10-18",
  },
  "100kb-photo": {
    id: "100kb-photo",
    path: "/tools/100kb-photo",
    name: "100KB Photo Resizer",
    navLabel: "100KB photo",
    summary: "Bring a phone photo down to 100 KB with good quality, for portals, profiles and email.",
    linkText: "Resize a photo to 100KB",
    category: "size",
    related: ["50kb-photo", "200kb-photo", "image-compressor", "resize-image-to-kb"],
    updated: "2026-10-07",
  },
  "200kb-photo": {
    id: "200kb-photo",
    path: "/tools/200kb-photo",
    name: "200KB Photo Resizer",
    navLabel: "200KB photo",
    summary: "Shrink a large photo to 200 KB while keeping plenty of detail and resolution.",
    linkText: "Resize a photo to 200KB",
    category: "size",
    related: ["100kb-photo", "500kb-photo", "50kb-photo", "neet-photo", "image-size-increase", "resize-image-to-kb"],
    updated: "2026-10-18",
  },
  "500kb-photo": {
    id: "500kb-photo",
    path: "/tools/500kb-photo",
    name: "500KB Image Compressor",
    navLabel: "500KB photo",
    summary: "Bring a large photo or document scan under 500 KB while keeping it sharp.",
    linkText: "Compress an image to 500KB",
    category: "size",
    related: ["200kb-photo", "100kb-photo", "image-compressor", "compress-pdf", "photo-to-pdf", "resize-image-to-kb"],
    updated: "2026-11-11",
  },
  "200x230-photo": {
    id: "200x230-photo",
    path: "/tools/200x230-photo",
    menu: false,
    name: "200×230 Photo Resizer",
    navLabel: "200×230 photo",
    summary: "Resize a photo to 200 × 230 pixels and 20–50 KB, the size bank recruitment forms prefer.",
    linkText: "Resize a photo to 200 × 230 pixels",
    category: "size",
    related: ["140x60-signature", "thumb-impression-resizer", "ibps-photo", "sbi-photo", "50kb-photo", "passport-photo-resizer"],
    updated: "2026-11-13",
  },
  "413x531-photo": {
    id: "413x531-photo",
    path: "/tools/413x531-photo",
    menu: false,
    name: "413×531 Photo (3.5×4.5 cm)",
    navLabel: "413×531 photo",
    summary: "Crop a photo to 413 × 531 pixels, the 3.5 × 4.5 cm passport size at 300 DPI, for print or upload.",
    linkText: "Resize a photo to 413 × 531 pixels (3.5 × 4.5 cm)",
    category: "size",
    related: ["passport-photo", "630x810-photo", "resize-image-in-cm", "passport-photo-resizer", "white-background-photo"],
    updated: "2026-11-13",
  },
  "630x810-photo": {
    id: "630x810-photo",
    path: "/tools/630x810-photo",
    menu: false,
    name: "630×810 Photo Resizer",
    navLabel: "630×810 photo",
    summary: "Resize a photo to exactly 630 × 810 pixels, a sharp 7:9 passport-style photo, with an optional KB limit.",
    linkText: "Resize a photo to 630 × 810 pixels",
    category: "size",
    related: ["413x531-photo", "200x230-photo", "passport-photo-resizer", "resize-image-to-kb"],
    updated: "2026-11-13",
  },
  "600x600-photo": {
    id: "600x600-photo",
    path: "/tools/600x600-photo",
    menu: false,
    name: "600×600 Photo (2×2 inch)",
    navLabel: "600×600 photo",
    summary: "Make a square 600 × 600 pixel photo, the 2 × 2 inch US passport size at 300 DPI.",
    linkText: "Make a 600 × 600 pixel (2 × 2 inch) photo",
    category: "size",
    related: ["passport-photo", "413x531-photo", "circle-crop", "passport-photo-resizer"],
    updated: "2026-11-13",
  },
  "140x60-signature": {
    id: "140x60-signature",
    path: "/tools/140x60-signature",
    menu: false,
    name: "140×60 Signature Resizer",
    navLabel: "140×60 signature",
    summary: "Resize a signature to 140 × 60 pixels under 20 KB, with the paper cleaned to white.",
    linkText: "Resize a signature to 140 × 60 pixels",
    category: "size",
    related: ["20kb-signature", "200x230-photo", "thumb-impression-resizer", "signature-resizer", "ibps-photo"],
    updated: "2026-11-13",
  },
  "20kb-signature": {
    id: "20kb-signature",
    path: "/tools/20kb-signature",
    menu: false,
    name: "20KB Signature Resizer",
    navLabel: "20KB signature",
    summary: "Get a signature under 20 KB with a clean white background, for SSC and bank forms.",
    linkText: "Resize a signature to 20KB",
    category: "size",
    related: ["140x60-signature", "30kb-signature", "ssc-photo", "signature-resizer", "10kb-photo"],
    updated: "2026-11-13",
  },
  "30kb-signature": {
    id: "30kb-signature",
    path: "/tools/30kb-signature",
    menu: false,
    name: "30KB Signature Resizer",
    navLabel: "30KB signature",
    summary: "Make a sharp signature JPG of up to 30 KB, with the paper whitened.",
    linkText: "Resize a signature to 30KB",
    category: "size",
    related: ["20kb-signature", "rrb-photo", "signature-resizer", "30kb-photo"],
    updated: "2026-11-13",
  },
  "thumb-impression-resizer": {
    id: "thumb-impression-resizer",
    path: "/tools/thumb-impression-resizer",
    name: "Thumb Impression Resizer",
    navLabel: "Thumb impression",
    summary: "Resize a left thumb impression to 240 × 240 pixels and 20–50 KB, or your form's size.",
    linkText: "Resize a thumb impression to 240 × 240 pixels",
    category: "edit",
    related: ["signature-resizer", "200x230-photo", "140x60-signature", "ibps-photo", "sbi-photo", "indian-bank-photo"],
    updated: "2026-11-13",
  },
  "ssc-photo": {
    id: "ssc-photo",
    path: "/tools/ssc-photo",
    name: "SSC Photo & Signature",
    navLabel: "SSC photo",
    summary: "What SSC currently asks for: live photo capture rules and a signature resized to 10–20 KB.",
    linkText: "Prepare your SSC signature and photo",
    category: "application",
    related: ["20kb-signature", "signature-resizer", "20kb-photo", "image-cropper", "resize-image-to-kb", "passport-photo-resizer"],
    updated: "2026-11-14",
  },
  "upsc-photo": {
    id: "upsc-photo",
    path: "/tools/upsc-photo",
    name: "UPSC Photo Resizer",
    navLabel: "UPSC photo",
    summary: "Crop and size a photo or signature for a UPSC application using the numbers in your notice.",
    linkText: "Prepare a photo for a UPSC application",
    category: "application",
    related: ["image-cropper", "resize-image-to-kb", "passport-photo-resizer", "signature-resizer", "50kb-photo", "image-compressor"],
    updated: "2026-10-07",
  },
  "ibps-photo": {
    id: "ibps-photo",
    path: "/tools/ibps-photo",
    name: "IBPS Photo Resizer",
    navLabel: "IBPS photo",
    summary: "Make a 200 × 230 px, 20–50 KB photo and a 140 × 60 px signature for IBPS CRP applications.",
    linkText: "Resize a photo for IBPS",
    category: "application",
    related: ["sbi-photo", "200x230-photo", "140x60-signature", "thumb-impression-resizer", "signature-resizer", "resize-image-to-kb"],
    updated: "2026-10-18",
  },
  "sbi-photo": {
    id: "sbi-photo",
    path: "/tools/sbi-photo",
    name: "SBI Photo Resizer",
    navLabel: "SBI photo",
    summary: "Prepare the photo and signature sizes stated in current SBI recruitment advertisements.",
    linkText: "Resize a photo for SBI recruitment",
    category: "application",
    related: ["ibps-photo", "200x230-photo", "140x60-signature", "thumb-impression-resizer", "signature-resizer", "resize-image-to-kb"],
    updated: "2026-10-18",
  },
  "neet-photo": {
    id: "neet-photo",
    path: "/tools/neet-photo",
    name: "NEET Photo Resizer",
    navLabel: "NEET photo",
    summary: "Prepare a NEET (UG) photograph within 10–200 KB and a signature within 10–100 KB.",
    linkText: "Resize a photo for NEET",
    category: "application",
    related: ["200kb-photo", "100kb-photo", "signature-resizer", "image-cropper", "jee-main-photo", "resize-image-to-kb"],
    updated: "2026-10-25",
  },
  "jee-main-photo": {
    id: "jee-main-photo",
    path: "/tools/jee-main-photo",
    name: "JEE Main Photo & Signature",
    navLabel: "JEE Main photo",
    summary: "Prepare the JEE (Main) 2027 photo as a 10–200 KB JPG and the signature as a 10–100 KB JPG, per NTA's bulletin.",
    linkText: "Resize a photo for JEE Main",
    category: "application",
    related: ["neet-photo", "200kb-photo", "signature-resizer", "compress-pdf", "image-cropper", "resize-image-to-kb"],
    updated: "2026-10-25",
  },
  "passport-photo": {
    id: "passport-photo",
    path: "/tools/passport-photo",
    name: "Passport Size Photo",
    navLabel: "Passport size photo",
    summary: "Officially sourced passport photo sizes by country, with a tool to make a photo that matches.",
    linkText: "Check passport photo size by country",
    category: "application",
    related: ["passport-photo-resizer", "413x531-photo", "600x600-photo", "white-background-photo", "image-cropper", "resize-image-to-kb"],
    updated: "2026-11-11",
  },
  "image-upscaler": {
    id: "image-upscaler",
    path: "/tools/image-upscaler",
    name: "Image Upscaler",
    navLabel: "Upscale",
    summary: "Enlarge an image 2× or 4× with Lanczos resampling and optional sharpening, for crisper results than a plain stretch.",
    linkText: "Upscale an image 2× or 4×",
    category: "resize",
    related: ["image-size-increase", "image-quality-enhancer", "image-resizer", "image-compressor"],
    updated: "2026-10-07",
  },
  "background-remover": {
    id: "background-remover",
    path: "/tools/background-remover",
    name: "Background Remover",
    navLabel: "Remove background",
    summary: "Cut out the main subject of a photo and download it as a transparent PNG or on a new background colour.",
    linkText: "Remove the background from an image",
    category: "edit",
    related: ["white-background-photo", "circle-crop", "image-compressor", "image-resizer", "png-to-jpg", "image-cropper"],
    updated: "2026-10-07",
  },
  "photo-to-pdf": {
    id: "photo-to-pdf",
    path: "/tools/photo-to-pdf",
    name: "Photo to PDF",
    navLabel: "Photo to PDF",
    summary: "Combine JPG, PNG, WebP and HEIC photos into one PDF, with page size, orientation, fit and margins.",
    linkText: "Convert photos to a PDF",
    category: "convert",
    related: ["jpg-to-pdf", "merge-images", "aadhaar-front-and-back", "compress-pdf", "png-to-jpg", "merge-pdf"],
    updated: "2026-10-18",
  },
  "merge-images": {
    id: "merge-images",
    path: "/tools/merge-images",
    name: "Merge Images",
    navLabel: "Merge images",
    summary: "Combine several images into one, side by side, stacked or in a grid, with optional spacing and background.",
    linkText: "Merge several images into one",
    category: "edit",
    related: ["merge-photo-and-signature", "aadhaar-front-and-back", "photo-to-pdf", "image-resizer", "image-compressor", "image-cropper"],
    updated: "2026-10-30",
  },
  "jpeg-to-jpg": {
    id: "jpeg-to-jpg",
    path: "/tools/jpeg-to-jpg",
    name: "JPEG to JPG Converter",
    navLabel: "JPEG to JPG",
    summary: "Change .jpeg, .jpe and .jfif files to .jpg, unchanged or re-saved, one at a time or in a batch.",
    linkText: "Convert JPEG files to .jpg",
    category: "convert",
    related: ["jpg-to-png", "png-to-jpg", "image-compressor", "image-resizer"],
    updated: "2026-10-07",
  },
  "jpg-to-pdf": {
    id: "jpg-to-pdf",
    path: "/tools/jpg-to-pdf",
    name: "JPG to PDF Converter",
    navLabel: "JPG to PDF",
    summary: "Turn JPG photos and scans into a PDF without recompressing them, one page per image.",
    linkText: "Convert JPG to PDF",
    category: "convert",
    related: ["photo-to-pdf", "pdf-to-jpg", "compress-pdf", "merge-images", "merge-pdf"],
    updated: "2026-10-18",
  },
  "image-size-increase": {
    id: "image-size-increase",
    path: "/tools/image-size-increase",
    name: "Image Size Increase",
    navLabel: "Increase size",
    summary: "Make an image bigger in pixels, or make the file bigger in KB to meet a minimum upload size.",
    linkText: "Increase image size in pixels or KB",
    category: "resize",
    related: ["image-upscaler", "image-resizer", "image-quality-enhancer", "resize-image-to-kb"],
    updated: "2026-10-07",
  },
  "image-quality-enhancer": {
    id: "image-quality-enhancer",
    path: "/tools/image-quality-enhancer",
    name: "Image Quality Enhancer",
    navLabel: "Enhance",
    summary: "Improve dull, dark or slightly soft photos with auto levels, contrast, colour, clarity and sharpening.",
    linkText: "Enhance image quality",
    category: "edit",
    related: ["image-upscaler", "image-compressor", "image-resizer", "background-remover"],
    updated: "2026-10-07",
  },
  "mb-to-kb-converter": {
    id: "mb-to-kb-converter",
    path: "/tools/mb-to-kb-converter",
    name: "MB to KB Converter",
    navLabel: "MB to KB",
    summary: "Convert MB to KB and back, in both decimal (1 MB = 1000 KB) and binary (1 MiB = 1024 KiB) units.",
    linkText: "Convert MB to KB",
    category: "units",
    related: ["resize-image-to-kb", "50kb-photo", "100kb-photo", "image-compressor"],
    updated: "2026-10-07",
  },
  "word-to-pdf": {
    id: "word-to-pdf",
    path: "/tools/word-to-pdf",
    name: "Word to PDF Converter",
    navLabel: "Word to PDF",
    summary: "Convert a Word .docx document to PDF in your browser, keeping its page size, tables, lists and images.",
    linkText: "Convert Word DOCX to PDF",
    category: "pdf",
    related: ["pdf-to-word", "merge-pdf", "jpg-to-pdf", "photo-to-pdf"],
    updated: "2026-10-12",
  },
  "pdf-to-word": {
    id: "pdf-to-word",
    path: "/tools/pdf-to-word",
    name: "PDF to Word Converter",
    navLabel: "PDF to Word",
    summary: "Turn a text-based PDF into an editable Word .docx with paragraphs, headings, lists and simple tables.",
    linkText: "Convert PDF to editable Word",
    category: "pdf",
    related: ["word-to-pdf", "merge-pdf", "pdf-to-jpg", "compress-pdf"],
    updated: "2026-10-18",
  },
  "merge-pdf": {
    id: "merge-pdf",
    path: "/tools/merge-pdf",
    name: "Merge PDF",
    navLabel: "Merge PDF",
    summary: "Combine several PDF files into one, in the order you choose, without changing their pages.",
    linkText: "Merge PDF files into one",
    category: "pdf",
    related: ["compress-pdf", "word-to-pdf", "pdf-to-word", "jpg-to-pdf", "photo-to-pdf"],
    updated: "2026-10-18",
  },
  "compress-pdf": {
    id: "compress-pdf",
    path: "/tools/compress-pdf",
    name: "Compress PDF",
    navLabel: "Compress PDF",
    summary: "Reduce a PDF to a target size such as 100 KB, 200 KB or 500 KB for upload forms, keeping it as readable as possible.",
    linkText: "Compress a PDF to 100KB, 200KB or any size",
    category: "pdf",
    related: ["merge-pdf", "pdf-to-jpg", "jpg-to-pdf", "resize-image-to-kb", "photo-to-pdf"],
    updated: "2026-10-18",
  },
  "pdf-to-jpg": {
    id: "pdf-to-jpg",
    path: "/tools/pdf-to-jpg",
    name: "PDF to JPG Converter",
    navLabel: "PDF to JPG",
    summary: "Turn every page of a PDF into a JPG image at 72, 150 or 300 DPI, with an optional size limit per image.",
    linkText: "Convert PDF pages to JPG images",
    category: "pdf",
    related: ["pdf-to-png", "jpg-to-pdf", "compress-pdf", "pdf-to-word", "resize-image-to-kb", "image-compressor"],
    updated: "2026-10-31",
  },
  "rrb-photo": {
    id: "rrb-photo",
    path: "/tools/rrb-photo",
    name: "RRB Photo & Signature",
    navLabel: "RRB photo",
    summary: "RRB NTPC and Station Master 2026 take the photo live; prepare the 30–49 KB signature JPG the form asks for.",
    linkText: "Prepare your RRB NTPC or Station Master signature",
    category: "application",
    related: ["signature-resizer", "rrc-apprentice-photo", "ssc-photo", "compress-pdf", "image-cropper", "resize-image-to-kb"],
    updated: "2026-11-04",
  },
  "upsssc-photo": {
    id: "upsssc-photo",
    path: "/tools/upsssc-photo",
    name: "UPSSSC Photo & Signature",
    navLabel: "UPSSSC photo",
    summary: "The UPSSSC OTR photo (50–100 KB) and signature with your name in Hindi below it (30–50 KB), as JPGs.",
    linkText: "Prepare your UPSSSC OTR photo and signature",
    category: "application",
    related: ["signature-resizer", "100kb-photo", "50kb-photo", "upessc-photo", "image-cropper", "resize-image-to-kb"],
    updated: "2026-10-25",
  },
  "upessc-photo": {
    id: "upessc-photo",
    path: "/tools/upessc-photo",
    name: "UPESSC Photo & Signature",
    navLabel: "UPESSC photo",
    summary: "The UPESSC myOTR photo, signature and hand-written declaration (10–100 KB each) for UP TGT and every UPESSC exam.",
    linkText: "Prepare your UPESSC OTR photo, signature and declaration",
    category: "application",
    related: ["upsssc-photo", "signature-resizer", "100kb-photo", "compress-pdf", "image-cropper", "resize-image-to-kb"],
    updated: "2026-10-25",
  },
  "rrc-apprentice-photo": {
    id: "rrc-apprentice-photo",
    path: "/tools/rrc-apprentice-photo",
    name: "Railway Apprentice Photo & Signature",
    navLabel: "Railway apprentice photo",
    summary: "The RRC Central Railway Act Apprentice photo (20–70 KB) and signature (20–30 KB), 3.5 × 3.5 cm JPGs at 100 DPI.",
    linkText: "Prepare your Central Railway apprentice photo and signature",
    category: "application",
    related: ["rrb-photo", "signature-resizer", "resize-image-in-cm", "change-image-dpi", "compress-pdf", "resize-image-to-kb"],
    updated: "2026-11-04",
  },
  "indian-bank-photo": {
    id: "indian-bank-photo",
    path: "/tools/indian-bank-photo",
    name: "Indian Bank Photo & Signature",
    navLabel: "Indian Bank photo",
    summary: "The Indian Bank Apprentice 2026-27 photo, signature, left thumb impression and hand-written declaration files.",
    linkText: "Prepare your Indian Bank apprentice photo, signature, thumb and declaration",
    category: "application",
    related: ["ibps-photo", "sbi-photo", "signature-resizer", "50kb-photo", "image-cropper", "resize-image-to-kb"],
    updated: "2026-11-04",
  },
  "kea-photo": {
    id: "kea-photo",
    path: "/tools/kea-photo",
    name: "KEA Photo & Signature",
    navLabel: "KEA photo",
    summary: "The KEA FDA/SDA 2026 photo (50–200 KB, white background) and signature (50–70 KB) as JPEGs.",
    linkText: "Prepare your KEA FDA/SDA photo and signature",
    category: "application",
    related: ["white-background-photo", "signature-resizer", "200kb-photo", "100kb-photo", "image-cropper", "resize-image-to-kb"],
    updated: "2026-11-04",
  },
  "afcat-photo": {
    id: "afcat-photo",
    path: "/tools/afcat-photo",
    name: "AFCAT Photo, Signature & Thumb",
    navLabel: "AFCAT photo",
    summary: "The AFCAT 01/2027 photo (100–200 KB), signature (80–150 KB) and thumb impression (50–100 KB), saved under the file names the notice asks for.",
    linkText: "Prepare your AFCAT photo, signature and thumb impression",
    category: "application",
    related: ["signature-resizer", "thumb-impression-resizer", "200kb-photo", "100kb-photo", "image-cropper", "resize-image-to-kb"],
    updated: "2026-11-14",
  },
  "cuet-photo": {
    id: "cuet-photo",
    path: "/tools/cuet-photo",
    name: "CUET Photo & Signature",
    navLabel: "CUET photo",
    summary: "The CUET (UG) photo (10–200 KB, 80% face, white background) and signature (10–50 KB), from NTA's latest bulletin.",
    linkText: "Prepare your CUET photo and signature",
    category: "application",
    related: ["neet-photo", "jee-main-photo", "white-background-photo", "signature-resizer", "200kb-photo", "image-cropper"],
    updated: "2026-11-14",
  },
  "ctet-photo": {
    id: "ctet-photo",
    path: "/tools/ctet-photo",
    name: "CTET Photo & Signature",
    navLabel: "CTET photo",
    summary: "The CTET photo (3.5 × 4.5 cm, 10–100 KB) and signature (3.5 × 1.5 cm, 3–30 KB), from CBSE's latest bulletin.",
    linkText: "Prepare your CTET photo and signature",
    category: "application",
    related: ["signature-resizer", "resize-image-in-cm", "100kb-photo", "30kb-signature", "image-cropper", "resize-image-to-kb"],
    updated: "2026-11-14",
  },
  "up-police-photo": {
    id: "up-police-photo",
    path: "/tools/up-police-photo",
    name: "UP Police Photo & Signature",
    navLabel: "UP Police photo",
    summary: "The UP Police constable live photo rules and a black-pen signature of 30–50 KB, 140 × 60 px or 50 × 20 mm.",
    linkText: "Prepare your UP Police signature and photo",
    category: "application",
    related: ["rrb-photo", "upsssc-photo", "140x60-signature", "signature-resizer", "image-cropper", "resize-image-to-kb"],
    updated: "2026-11-14",
  },
  "driving-licence-photo": {
    id: "driving-licence-photo",
    path: "/tools/driving-licence-photo",
    name: "Driving Licence Photo & Signature",
    navLabel: "Driving licence photo",
    summary: "The Sarathi driving and learner's licence photo (420 × 525 px) and signature (256 × 64 px), each 10–20 KB.",
    linkText: "Prepare your driving licence photo and signature",
    category: "application",
    related: ["voter-id-photo", "white-background-photo", "signature-resizer", "20kb-photo", "passport-photo", "image-cropper"],
    updated: "2026-11-13",
  },
  "voter-id-photo": {
    id: "voter-id-photo",
    path: "/tools/voter-id-photo",
    name: "Voter ID Photo",
    navLabel: "Voter ID photo",
    summary: "The voter ID (Form 6 / Form 8) photo: 4.5 × 3.5 cm, white background, JPG up to 2 MB.",
    linkText: "Prepare your voter ID photo",
    category: "application",
    related: ["driving-licence-photo", "white-background-photo", "413x531-photo", "passport-photo", "aadhaar-front-and-back", "image-cropper"],
    updated: "2026-11-13",
  },
  "dsssb-photo": {
    id: "dsssb-photo",
    path: "/tools/dsssb-photo",
    name: "DSSSB Photo & Signature",
    navLabel: "DSSSB photo",
    summary: "What DSSSB's 2026 advertisements ask for: the photo rules, the signature, and a 15–60 KB scanned photo ID.",
    linkText: "Prepare your DSSSB photo, signature and ID scan",
    category: "application",
    related: ["signature-resizer", "resize-image-to-kb", "image-cropper", "upsssc-photo", "rrb-photo", "50kb-photo"],
    updated: "2026-11-14",
  },
  "image-to-jpg": {
    id: "image-to-jpg",
    path: "/tools/image-to-jpg",
    name: "Image to JPG Converter",
    navLabel: "Image to JPG",
    summary: "Convert PNG, WebP, HEIC, GIF, BMP or AVIF images to JPG, with an optional size limit such as 50 KB or 100 KB.",
    linkText: "Convert any image to JPG",
    category: "convert",
    related: ["png-to-jpg", "webp-to-jpg", "heic-to-jpg", "resize-image-to-kb", "image-compressor"],
    updated: "2026-10-18",
  },
  "merge-photo-and-signature": {
    id: "merge-photo-and-signature",
    path: "/tools/merge-photo-and-signature",
    name: "Photo and Signature Joiner",
    navLabel: "Photo + signature",
    summary: "Join a photo and a signature into one JPG, signature below or beside the photo, under a KB limit.",
    linkText: "Merge a photo and signature into one image",
    category: "edit",
    related: ["signature-resizer", "add-name-and-date-on-photo", "merge-images", "resize-image-to-kb", "passport-photo-resizer", "20kb-photo"],
    updated: "2026-10-31",
  },
  "aadhaar-front-and-back": {
    id: "aadhaar-front-and-back",
    path: "/tools/aadhaar-front-and-back",
    name: "Aadhaar Front and Back in One Page",
    navLabel: "Front + back in one page",
    summary: "Put the front and back of an Aadhaar, PAN or any ID card on one A4 PDF page or one JPG, under a KB limit.",
    linkText: "Combine the front and back of a card in one page",
    category: "edit",
    related: ["merge-images", "merge-photo-and-signature", "photo-to-pdf", "compress-pdf", "image-cropper", "resize-image-to-kb"],
    updated: "2026-11-04",
  },
  "add-name-and-date-on-photo": {
    id: "add-name-and-date-on-photo",
    path: "/tools/add-name-and-date-on-photo",
    name: "Name and Date on Photo",
    navLabel: "Name & date on photo",
    summary: "Print your name and the date the photo was taken below it, with a Kerala PSC 150 × 200 px, 30 KB preset.",
    linkText: "Add your name and date on a photo",
    category: "edit",
    related: ["merge-photo-and-signature", "white-background-photo", "passport-photo-resizer", "image-cropper", "resize-image-to-kb", "20kb-photo"],
    updated: "2026-10-30",
  },
  "change-image-dpi": {
    id: "change-image-dpi",
    path: "/tools/change-image-dpi",
    name: "Change Image DPI",
    navLabel: "Change DPI",
    summary: "Check the DPI of a JPG or PNG and change it to 300, 200 or any value without touching its pixels or quality.",
    linkText: "Change the DPI of an image",
    category: "edit",
    related: ["resize-image-in-cm", "resize-jpg", "image-resizer", "passport-photo-resizer", "pdf-to-jpg", "image-upscaler"],
    updated: "2026-10-30",
  },
  "resize-image-in-cm": {
    id: "resize-image-in-cm",
    path: "/tools/resize-image-in-cm",
    name: "Resize Image in CM",
    navLabel: "Resize in cm / mm",
    summary: "Resize a photo to an exact size in centimetres, millimetres or inches at the DPI you need, with an optional KB limit.",
    linkText: "Resize an image in cm or mm",
    category: "resize",
    related: ["change-image-dpi", "passport-photo-resizer", "image-resizer", "resize-image-to-kb", "image-cropper", "passport-photo"],
    updated: "2026-10-30",
  },
  "white-background-photo": {
    id: "white-background-photo",
    path: "/tools/white-background-photo",
    name: "White Background Photo",
    navLabel: "White background",
    summary: "Replace the background of a photo with plain white, or any colour, and save it as a JPG or PNG.",
    linkText: "Change a photo background to white",
    category: "edit",
    related: ["background-remover", "passport-photo-resizer", "add-name-and-date-on-photo", "image-cropper", "resize-image-to-kb", "png-to-jpg"],
    updated: "2026-10-30",
  },
  "transparent-signature": {
    id: "transparent-signature",
    path: "/tools/transparent-signature",
    name: "Transparent Signature Maker",
    navLabel: "Transparent signature",
    summary: "Turn a photo of your signature into a PNG with a see-through background, in its own ink or solid black or blue.",
    linkText: "Make a transparent signature PNG",
    category: "edit",
    related: ["signature-resizer", "merge-photo-and-signature", "background-remover", "image-cropper", "resize-image-to-kb"],
    updated: "2026-10-31",
  },
  "circle-crop": {
    id: "circle-crop",
    path: "/tools/circle-crop",
    name: "Circle Crop Image",
    navLabel: "Circle crop",
    summary: "Crop a photo or logo into a circle and save it as a transparent PNG, or a JPG with filled corners, with an optional border.",
    linkText: "Crop an image into a circle",
    category: "edit",
    related: ["image-cropper", "background-remover", "resize-png", "image-resizer", "merge-images"],
    updated: "2026-10-31",
  },
  "jpg-to-webp": {
    id: "jpg-to-webp",
    path: "/tools/jpg-to-webp",
    name: "JPG to WebP Converter",
    navLabel: "JPG to WebP",
    summary: "Convert JPG or PNG images to WebP for faster web pages, keeping PNG transparency, with an optional size limit.",
    linkText: "Convert JPG or PNG to WebP",
    category: "convert",
    related: ["webp-to-png", "webp-to-jpg", "image-compressor", "resize-webp", "png-to-jpg"],
    updated: "2026-10-31",
  },
  "webp-to-png": {
    id: "webp-to-png",
    path: "/tools/webp-to-png",
    name: "WebP to PNG Converter",
    navLabel: "WebP to PNG",
    summary: "Convert WebP images to lossless PNG files that keep transparent backgrounds and open in any editor.",
    linkText: "Convert WebP to PNG",
    category: "convert",
    related: ["webp-to-jpg", "jpg-to-webp", "jpg-to-png", "resize-png", "image-to-jpg"],
    updated: "2026-10-31",
  },
  "heic-to-png": {
    id: "heic-to-png",
    path: "/tools/heic-to-png",
    name: "HEIC to PNG Converter",
    navLabel: "HEIC to PNG",
    summary: "Convert iPhone HEIC photos to lossless PNG files for editing, cut-outs and apps that don't open HEIC.",
    linkText: "Convert HEIC to PNG",
    category: "convert",
    related: ["heic-to-jpg", "jpg-to-png", "image-to-jpg", "image-resizer", "background-remover"],
    updated: "2026-10-31",
  },
  "pdf-to-png": {
    id: "pdf-to-png",
    path: "/tools/pdf-to-png",
    name: "PDF to PNG Converter",
    navLabel: "PDF to PNG",
    summary: "Turn every page of a PDF into a sharp, lossless PNG image at 72, 150 or 300 DPI.",
    linkText: "Convert PDF pages to PNG images",
    category: "pdf",
    related: ["pdf-to-jpg", "jpg-to-pdf", "compress-pdf", "pdf-to-word", "merge-pdf"],
    updated: "2026-10-31",
  },
};

/** Display order used across the site. */
export const toolOrder: ToolId[] = [
  "image-resizer",
  "image-compressor",
  "resize-image-to-kb",
  "image-upscaler",
  "image-size-increase",
  "image-quality-enhancer",
  "background-remover",
  "white-background-photo",
  "merge-images",
  "merge-photo-and-signature",
  "thumb-impression-resizer",
  "aadhaar-front-and-back",
  "add-name-and-date-on-photo",
  "image-to-jpg",
  "jpg-to-png",
  "png-to-jpg",
  "webp-to-jpg",
  "jpg-to-webp",
  "webp-to-png",
  "bulk-image-resizer",
  "resize-jpg",
  "resize-png",
  "resize-webp",
  "resize-gif",
  "instagram-image-resizer",
  "resize-image-in-cm",
  "change-image-dpi",
  "image-cropper",
  "circle-crop",
  "passport-photo-resizer",
  "signature-resizer",
  "transparent-signature",
  "heic-to-jpg",
  "heic-to-png",
  "svg-to-png",
  "png-to-svg",
  "jpeg-to-jpg",
  "photo-to-pdf",
  "jpg-to-pdf",
  "word-to-pdf",
  "pdf-to-word",
  "merge-pdf",
  "compress-pdf",
  "pdf-to-jpg",
  "pdf-to-png",
  "10kb-photo",
  "20kb-photo",
  "30kb-photo",
  "50kb-photo",
  "100kb-photo",
  "200kb-photo",
  "500kb-photo",
  "200x230-photo",
  "413x531-photo",
  "630x810-photo",
  "600x600-photo",
  "140x60-signature",
  "20kb-signature",
  "30kb-signature",
  "mb-to-kb-converter",
  "ssc-photo",
  "upsc-photo",
  "ibps-photo",
  "sbi-photo",
  "neet-photo",
  "jee-main-photo",
  "rrb-photo",
  "upsssc-photo",
  "upessc-photo",
  "dsssb-photo",
  "rrc-apprentice-photo",
  "indian-bank-photo",
  "kea-photo",
  "afcat-photo",
  "cuet-photo",
  "ctet-photo",
  "up-police-photo",
  "driving-licence-photo",
  "voter-id-photo",
  "passport-photo",
];

export const allTools: ToolDefinition[] = toolOrder.map((id) => tools[id]);

export function getTool(id: ToolId): ToolDefinition {
  return tools[id];
}

export const NAV_GROUPS: { id: NavGroup; label: string }[] = [
  { id: "image", label: "Image tools" },
  { id: "convert", label: "Convert" },
  { id: "size", label: "Photo size" },
  { id: "application", label: "Exam & passport" },
  { id: "pdf", label: "PDF" },
];

export function toolsIn(group: NavGroup): ToolDefinition[] {
  return allTools.filter((tool) => navGroupOf(tool) === group);
}

/** Tools listed in the header menus: the group without its narrow size pages, so the menus fit a phone screen. */
export function menuToolsIn(group: NavGroup): ToolDefinition[] {
  return toolsIn(group).filter((tool) => tool.menu !== false);
}
