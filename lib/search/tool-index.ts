import { KEYWORD_MAP } from "@/lib/seo/keyword-map";
import { allTools, APPLICATION_HUB, PDF_HUB } from "@/lib/tools/registry";

/**
 * Search over every tool for the site search box. Loaded only when someone uses the box, so pages don't carry it.
 * Each tool is matched on its name, description and the searches people actually make for it (the keyword map),
 * plus everyday and Hinglish words ("photo ka size kam kare"), which are mapped to the words tools use.
 */
export interface ToolMatch {
  name: string;
  summary: string;
  href: string;
}

interface Entry {
  name: string;
  summary: string;
  href: string;
  nameText: string;
  primary: string;
  text: string;
  order: number;
}

const keywords = new Map(KEYWORD_MAP.map((target) => [target.path, target]));

const ENTRIES: Entry[] = [
  ...allTools.map((tool) => ({ name: tool.name, summary: tool.summary, href: tool.path, extra: tool.linkText })),
  { name: APPLICATION_HUB.name, summary: "Compare photo and signature sizes for IBPS, SBI, SSC, NEET, JEE, RRB and more.", href: APPLICATION_HUB.path, extra: "" },
  { name: PDF_HUB.name, summary: "Merge, compress and convert PDF and Word files in your browser.", href: PDF_HUB.path, extra: "" },
].map((tool, order) => {
  const target = keywords.get(tool.href);
  return {
    name: tool.name,
    summary: tool.summary,
    href: tool.href,
    nameText: normalize(tool.name),
    primary: normalize(target?.primary ?? ""),
    text: normalize([tool.name, tool.extra, tool.summary, target?.primary ?? "", ...(target?.secondary ?? [])].join(" ")),
    order,
  };
});

/** Everyday, Hinglish and Hindi words, mapped to words the tools are described with. */
const SYNONYMS: Record<string, string[]> = {
  kam: ["reduce", "compress", "resize"],
  kum: ["reduce", "compress", "resize"],
  chota: ["reduce", "compress", "resize"],
  choti: ["reduce", "compress", "resize"],
  ghatana: ["reduce", "compress", "resize"],
  shrink: ["reduce", "compress", "resize"],
  smaller: ["reduce", "compress", "resize"],
  decrease: ["reduce", "compress", "resize"],
  कम: ["reduce", "compress", "resize"],
  bada: ["increase", "enlarge"],
  badhana: ["increase", "enlarge"],
  bigger: ["increase", "enlarge"],
  foto: ["photo"],
  pic: ["photo"],
  pics: ["photo"],
  picture: ["photo"],
  tasveer: ["photo"],
  selfie: ["photo"],
  फोटो: ["photo"],
  img: ["image"],
  sign: ["signature"],
  hastakshar: ["signature"],
  हस्ताक्षर: ["signature"],
  size: ["resize"],
  saiz: ["size", "resize"],
  साइज: ["size", "resize"],
  kab: ["kb"],
  jpeg: ["jpg"],
  pasport: ["passport"],
  पासपोर्ट: ["passport"],
  bg: ["background"],
  safed: ["white"],
  angutha: ["thumb"],
  jodna: ["merge", "join"],
  combine: ["merge", "join"],
  railway: ["rrb"],
  round: ["circle"],
  dp: ["circle"],
  profile: ["circle"],
  bank: ["ibps", "sbi"],
  iphone: ["heic"],
};

/** Words that carry no meaning for finding a tool, in English and Hinglish. */
const STOP = new Set(["ka", "ki", "ke", "ko", "me", "mein", "main", "se", "kaise", "kare", "karen", "karein", "karna", "kya", "hai", "online", "free", "how", "to", "the", "a", "an", "my", "for", "of", "in", "and", "with", "tool", "tools", "app", "website", "do", "i", "can", "का", "की", "के", "को", "में", "से", "कैसे", "करें", "करे", "है"]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/(\d+)\s*-?\s*(kb|mb)\b/g, "$1$2")
    // \p{M} keeps Hindi vowel signs (matras), so "फोटो" stays one word.
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim();
}

function tokens(query: string): string[][] {
  return normalize(query)
    .split(" ")
    .filter((word) => word && !STOP.has(word))
    .map((word) => [word, ...(SYNONYMS[word] ?? [])]);
}

/** How well one query word fits a tool: 3 in the name, 2 in its main search, 1 anywhere, 0 not at all. */
function wordScore(entry: Entry, alternatives: string[]): number {
  // Words match from their start ("resize" finds "resizer"); words of two letters or fewer must match whole ("dp" isn't "dpi").
  const has = (text: string) => alternatives.some((word) => ` ${text} `.includes(word.length <= 2 ? ` ${word} ` : ` ${word}`));
  return has(entry.nameText) ? 3 : has(entry.primary) ? 2 : has(entry.text) ? 1 : 0;
}

export function searchTools(query: string, limit = 6): ToolMatch[] {
  const words = tokens(query);
  if (words.length === 0) return [];
  // The words in the order typed ("pdf to jpg") outrank the same words in another order ("jpg to pdf").
  const phrase = normalize(query);
  const scored = ENTRIES.map((entry) => {
    const scores = words.map((alternatives) => wordScore(entry, alternatives));
    const inOrder = words.length > 1 ? (` ${entry.nameText} `.includes(` ${phrase} `) ? 6 : ` ${entry.text} `.includes(` ${phrase} `) ? 4 : 0) : 0;
    return { entry, matched: scores.filter((s) => s > 0).length, score: scores.reduce((a, b) => a + b, 0) + inOrder };
  }).filter((row) => row.matched > 0);
  // "Size" with "reduce", or "KB", means a file-size limit, the most common job here ("photo ka size kam kare").
  const said = (list: string[]) => words.some((alternatives) => alternatives.some((word) => list.includes(word)));
  const sizeJob = said(["kb"]) || (said(["size"]) && said(["reduce", "compress"]));
  // A signature or PDF query is about that kind of file, whatever else it says.
  const boosts: Record<string, number> = said(["signature"])
    ? { "/tools/signature-resizer": 8, "/tools/transparent-signature": 4 }
    : said(["pdf"])
      ? sizeJob
        ? { "/tools/compress-pdf": 8 }
        : {}
      : sizeJob
        ? { "/tools/resize-image-to-kb": 8, "/tools/image-compressor": 5 }
        : {};
  // Tools matching every word come first, best fit first; closer partial matches follow.
  const ranked = scored
    .map((row) => ({ ...row, rank: row.matched * 10 + row.score + (boosts[row.entry.href] ?? 0) }))
    .sort((a, b) => b.rank - a.rank || a.entry.order - b.entry.order)
    .map(({ entry }) => ({ name: entry.name, summary: entry.summary, href: entry.href }));

  // A typed size ("30kb", "30 kb") goes to that size's page, or to the KB tool with the target already set.
  const size = normalize(query).match(/\b(\d{1,5})kb\b/);
  if (size) {
    const kb = Number(size[1]);
    const page = ENTRIES.find((entry) => entry.href === `/tools/${kb}kb-photo`);
    const sized: ToolMatch | null = page
      ? { name: page.name, summary: page.summary, href: page.href }
      : kb >= 2 && kb <= 20_480
        ? { name: `Resize image to ${kb} KB`, summary: `Opens the exact-KB tool with ${kb} KB already set.`, href: `/tools/resize-image-to-kb?target=${kb}` }
        : null;
    if (sized) return [sized, ...ranked.filter((match) => match.href !== sized.href)].slice(0, limit);
  }
  return ranked.slice(0, limit);
}

/** Shown when the box is empty: the jobs most visitors come for. */
export const POPULAR: ToolMatch[] = ["/tools/resize-image-to-kb", "/tools/passport-photo", "/tools/image-compressor", "/tools/signature-resizer", "/tools/pdf-to-jpg"].flatMap((href) => {
  const entry = ENTRIES.find((e) => e.href === href);
  return entry ? [{ name: entry.name, summary: entry.summary, href: entry.href }] : [];
});
