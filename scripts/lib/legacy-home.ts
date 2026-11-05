import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { convertArticle, htmlToInline, toSpans, type ArticleBlock, type ArticleIssue } from "./legacy-article";
import type { ManifestAsset } from "./legacy-media";
import { findPriceTextInValue } from "./price-text";
import {
  checkPrices,
  createMediaResolver,
  issueCollector,
  localeString,
  localeText,
  sourceHashOf,
  type DocumentPlan,
} from "./legacy-documents";

// Phase 7 collections for migrate-content (docs/phase7-plan.md, section 4):
//   global — person, testimonial, audioFeature (from the reviewed seed)
//   home   — the homePage singleton (from the reviewed seed)
//   blog   — one blogPost per legacy article: metadata from blog.json and
//            the seed, the body converted from pages/blog/*.js
// References to documents this importer creates are weak with
// `_strengthenOnPublish`, so a draft may point at another draft; they become
// normal references when published. Romanian only.

export const HOME_SEED_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../config/legacy-home.json");
const SEED_SOURCE = "scripts/config/legacy-home.json";
export const PHASE7_COLLECTIONS = ["global", "home", "blog"] as const;
export type Phase7Collection = (typeof PHASE7_COLLECTIONS)[number];

type SeedLink = { label: string; kind: "page" | "phone" | "email" | "external"; page?: string; url?: string };
type Replacement = { find: string; replace: string; reason: string };
export interface SeedPost {
  file: string; legacyId: number; slug: string; title: string; excerpt: string;
  source?: { text: string; url?: string };
  relatedProjects: string[]; relatedServices: string[];
  replacements: Replacement[];
  /** Photo descriptions by exact legacy URL, or `*prefix` of the file name. */
  alts: Record<string, string>;
  review?: string[];
}
export interface HomeSeed {
  schemaVersion: 1;
  person: { id: string; name: string; role: string; portrait: string; portraitAlt: string };
  testimonial: {
    id: string; quote: string; name: string; role: string; context: string; date: string;
    portrait: string; portraitAlt: string; relatedProject: string; review?: string[];
  };
  audio: { id: string; title: string; audio: string; artwork: string; durationSeconds: number; relatedProject: string; review?: string[] };
  home: {
    hero: { title: string; highlight: string; tagline: string; lead: string; image: string; primaryCta: SeedLink; secondaryCta: SeedLink };
    services: { eyebrow: string; heading: string; intro: string };
    catalogues: { enabled: boolean; heading: string };
    audio: { eyebrow: string };
    blog: { heading: string; intro: string };
    about: { heading: string; body: string; poster: string; posterAlt: string; cta: SeedLink };
    review?: string[];
  };
  posts: SeedPost[];
}

export function loadHomeSeed(file = HOME_SEED_FILE): HomeSeed {
  const seed = JSON.parse(readFileSync(file, "utf8")) as HomeSeed;
  if (seed.schemaVersion !== 1 || !Array.isArray(seed.posts)) throw new Error(`Unsupported home seed: ${file}`);
  return seed;
}

export const blogPostId = (slug: string) => `legacy-blog-${slug}`;

export interface Phase7Context {
  legacyRoot: string;
  manifest: Map<string, ManifestAsset>;
  resolveAsset: (canonical: string) => string | undefined;
  seed: HomeSeed;
}

const ref = (id: string) => ({ _type: "reference" as const, _ref: id });
/** A reference to a document this importer writes as a draft. */
const weakRef = (id: string, type: string) => ({ ...ref(id), _weak: true, _strengthenOnPublish: { type } });
const keyedRefs = (ids: string[], prefix: string) => ids.map((id, index) => ({ ...ref(id), _key: `${prefix}${index}` }));

const link = (seed: SeedLink) => ({
  _type: "siteLink", label: localeString(seed.label), kind: seed.kind,
  ...(seed.page ? { page: seed.page } : {}), ...(seed.url ? { url: seed.url } : {}),
});

/** One-paragraph HTML (strong/em only) to Portable Text. */
function htmlBlocks(html: string, key: string, issues: ArticleIssue[]) {
  return [{ _type: "block", _key: key, style: "normal", markDefs: [], children: toSpans(htmlToInline(html, issues, SEED_SOURCE), key) }];
}

function plan(collection: Phase7Collection, key: string, document: DocumentPlan["document"], parts: {
  issues: DocumentPlan["issues"]; images: DocumentPlan["images"]; review?: string[];
}): DocumentPlan {
  const result: DocumentPlan = { key, collection: collection as DocumentPlan["collection"], document, images: parts.images, issues: parts.issues, review: [...(parts.review ?? [])] };
  checkPrices(result);
  // These texts go straight to public pages, where "preț" and "negociabil"
  // are not allowed either: here they block the record instead of a warning.
  const words = findPriceTextInValue(document).filter((finding) => finding.rule === "price-word" || finding.rule === "negotiable");
  for (const finding of words) result.issues.push({ severity: "error", code: "price-word", message: `${finding.path ?? "?"}: „${finding.match}” (${finding.message})` });
  if (words.length) result.review = result.review.filter((note) => !note.startsWith("Pricing word"));
  return result;
}

const legacyOf = (collection: string, legacySlug: string, sourceFile: string, source: unknown, legacyId?: string) => ({
  _type: "legacySource", collection, legacySlug, sourceFile, sourceHash: sourceHashOf(source), ...(legacyId ? { legacyId } : {}),
});

function mapGlobal(context: Phase7Context): DocumentPlan[] {
  const { person, testimonial, audio } = context.seed;
  const plans: DocumentPlan[] = [];
  {
    const { issues, issue } = issueCollector();
    const media = createMediaResolver(context, issue);
    plans.push(plan("global", `global:${person.id}`, {
      _id: person.id, _type: "person", name: person.name, role: localeString(person.role),
      portrait: media.image(person.portrait, SEED_SOURCE, "portrait", { alt: localeString(person.portraitAlt) }),
    }, { issues, images: media.needs }));
  }
  {
    const { issues, issue } = issueCollector();
    const media = createMediaResolver(context, issue);
    plans.push(plan("global", `global:${testimonial.id}`, {
      _id: testimonial.id, _type: "testimonial", quote: localeText(testimonial.quote), name: testimonial.name,
      role: localeString(testimonial.role), context: localeString(testimonial.context), date: testimonial.date,
      portrait: media.image(testimonial.portrait, SEED_SOURCE, "portrait", { alt: localeString(testimonial.portraitAlt) }),
      relatedProject: ref(testimonial.relatedProject),
      legacy: legacyOf("global", "components/landing.jsx#testimonial", SEED_SOURCE, testimonial),
    }, { issues, images: media.needs, review: testimonial.review }));
  }
  {
    const { issues, issue } = issueCollector();
    const media = createMediaResolver(context, issue);
    plans.push(plan("global", `global:${audio.id}`, {
      _id: audio.id, _type: "audioFeature", title: localeString(audio.title),
      audio: media.file(audio.audio, SEED_SOURCE, "audio"),
      // Decorative: no description.
      artwork: media.image(audio.artwork, SEED_SOURCE, "artwork"),
      durationSeconds: audio.durationSeconds, relatedProject: ref(audio.relatedProject),
      legacy: legacyOf("global", "components/landing.jsx#audio", SEED_SOURCE, audio),
    }, { issues, images: media.needs, review: audio.review }));
  }
  return plans;
}

function mapHome(context: Phase7Context): DocumentPlan[] {
  const { home, testimonial, audio } = context.seed;
  const { issues, issue } = issueCollector();
  const media = createMediaResolver(context, issue);
  const htmlIssues: ArticleIssue[] = [];
  const document = {
    _id: "homePage", _type: "homePage", publishedLanguages: ["ro"],
    hero: {
      title: localeString(home.hero.title), highlight: localeString(home.hero.highlight),
      tagline: localeString(home.hero.tagline), lead: localeText(home.hero.lead),
      image: media.image(home.hero.image, SEED_SOURCE, "hero"),
      primaryCta: link(home.hero.primaryCta), secondaryCta: link(home.hero.secondaryCta),
    },
    services: {
      enabled: true, eyebrow: localeString(home.services.eyebrow), heading: localeString(home.services.heading),
      intro: { _type: "localeBlockContent", ro: htmlBlocks(home.services.intro, "intro", htmlIssues) },
    },
    catalogues: { enabled: home.catalogues.enabled, heading: localeString(home.catalogues.heading) },
    testimonial: { enabled: true, testimonial: weakRef(testimonial.id, "testimonial") },
    audio: { enabled: true, eyebrow: localeString(home.audio.eyebrow), recording: weakRef(audio.id, "audioFeature") },
    blog: { enabled: true, heading: localeString(home.blog.heading), intro: localeString(home.blog.intro) },
    about: {
      enabled: true, heading: localeString(home.about.heading),
      body: { _type: "localeBlockContent", ro: htmlBlocks(home.about.body, "about", htmlIssues) },
      poster: media.image(home.about.poster, SEED_SOURCE, "about poster", { alt: localeString(home.about.posterAlt) }),
      cta: link(home.about.cta),
    },
  };
  for (const item of htmlIssues) issue(item.severity, item.code, item.message);
  return [plan("home", "home:homePage", document, { issues, images: media.needs, review: home.review })];
}

/** Applies each reviewed replacement to the spans; one that matches nothing is an error. */
function applyReplacements(blocks: ArticleBlock[], replacements: Replacement[], issue: ReturnType<typeof issueCollector>["issue"], review: string[]) {
  for (const { find, replace, reason } of replacements) {
    let hits = 0;
    for (const block of blocks) {
      if (block._type !== "block") continue;
      for (const span of block.children) {
        if (!span.text.includes(find)) continue;
        hits += span.text.split(find).length - 1;
        span.text = span.text.split(find).join(replace);
      }
    }
    if (!hits) issue("error", "replacement-unused", `Replacement „${find}” matches nothing.`);
    else review.push(`Changed „${find.trim()}” → „${replace.trim() || "(removed)"}” (${reason}).`);
  }
  // A span emptied by a replacement is dropped; an emptied block too.
  for (const block of blocks) {
    if (block._type !== "block") continue;
    block.children = block.children.filter((span) => span.text);
    const last = block.children.at(-1);
    if (last) last.text = last.text.replace(/\s+$/, "");
  }
  return blocks.filter((block) => block._type !== "block" || block.children.length);
}

function altFor(post: SeedPost, src: string, jsxAlt: string, title: string): string | undefined {
  if (post.alts[src]) return post.alts[src];
  const file = decodeURIComponent(path.posix.basename(new URL(src, "https://x").pathname));
  const prefix = Object.keys(post.alts).find((key) => key.startsWith("*") && file.startsWith(key.slice(1)));
  if (prefix) return post.alts[prefix];
  // The legacy page's own alt, unless it only repeats the title.
  return jsxAlt && jsxAlt.toLowerCase() !== title.toLowerCase() ? jsxAlt : undefined;
}

const KINDS: Record<string, string> = { Articol: "article", Raport: "report", Video: "video" };

function mapBlog(context: Phase7Context): DocumentPlan[] {
  const blogFile = "data/blog.json";
  const legacy = JSON.parse(readFileSync(path.join(context.legacyRoot, blogFile), "utf8")) as { posts: Array<Record<string, unknown>> };
  return context.seed.posts.map((post) => {
    const { issues, issue } = issueCollector();
    const review = [...(post.review ?? [])];
    const media = createMediaResolver(context, issue);
    const record = legacy.posts.find((item) => item.id === post.legacyId);
    if (!record) issue("error", "missing-record", `blog.json has no post with id ${post.legacyId}.`);
    if (path.basename(post.file, ".js") !== post.slug) issue("error", "slug-mismatch", `Slug ${post.slug} differs from the page file ${post.file}.`);
    if (record && record.href !== `/blog/${post.slug}`) review.push(`blog.json href ${String(record.href)} is wrong; the slug comes from the page file.`);

    const converted = convertArticle(path.join(context.legacyRoot, post.file), { post: record });
    for (const item of converted.issues) issue(item.severity, item.code, item.message.replace(`${context.legacyRoot}/`, ""));
    let blocks = applyReplacements(converted.blocks, post.replacements, issue, review);

    // A heading that only introduces a dropped video goes with it (decision 2).
    blocks = blocks.filter((block, index) => {
      const next = blocks[index + 1];
      const after = blocks[index + 2];
      const headingOnlyForVideo = block._type === "block" && (block.style === "h2" || block.style === "h3")
        && next?._type === "droppedVideo" && (!after || (after._type === "block" && (after.style === "h2" || after.style === "h3")));
      if (headingOnlyForVideo) review.push(`Heading „${block.children.map((span) => span.text).join("")}” dropped with its video.`);
      return !headingOnlyForVideo;
    });

    const title = post.title;
    const body = blocks.flatMap((block): Array<Record<string, unknown>> => {
      if (block._type === "block") return [block];
      if (block._type === "video") return [block];
      if (block._type === "droppedVideo") {
        review.push(`Video ${decodeURIComponent(block.src)} not imported until it is on YouTube (decision 2).`);
        return [];
      }
      const alt = altFor(post, block.src, block.alt, record ? String(record.title) : title);
      const image = media.image(block.src, post.file, `figure ${block._key}`, alt ? { alt: localeString(alt) } : {});
      return image ? [{ ...image, _key: block._key }] : [];
    });

    const cover = media.image(record?.imageUrl, blogFile, "cover");
    const shortDescription = String(record?.shortDescription ?? "").replace(/\s*\.{3}\s*$/, "").trim();
    if (post.excerpt.replace(/\.$/, "") !== shortDescription.replace(/\.$/, "")) review.push("Excerpt edited from blog.json shortDescription (typos, trailing „...”).");
    if (post.excerpt.length > 300) issue("error", "excerpt-too-long", `Excerpt has ${post.excerpt.length} characters (max 300).`);
    if (title.length > 140) issue("error", "title-too-long", `Title has ${title.length} characters (max 140).`);
    if (record && title !== record.title) review.push(`Title „${String(record.title)}” → „${title}”.`);
    const kind = KINDS[String(record?.blogType)];
    if (!kind) issue("error", "unknown-kind", `blogType ${String(record?.blogType)} is not Articol, Raport or Video.`);

    const document = {
      _id: blogPostId(post.slug), _type: "blogPost", language: "ro",
      title, slug: { _type: "slug", current: post.slug }, kind, publishedAt: record?.datetime,
      excerpt: post.excerpt, cover,
      author: weakRef(context.seed.person.id, "person"),
      ...(post.source ? { source: post.source } : {}),
      body,
      relatedProjects: keyedRefs(post.relatedProjects, "rp"),
      relatedServices: keyedRefs(post.relatedServices, "rs"),
      legacy: legacyOf("blog", `/blog/${post.slug}`, post.file, { post, record }, String(post.legacyId)),
    };
    return plan("blog", `blog:${post.slug}`, document, { issues, images: media.needs, review });
  });
}

export function mapPhase7(collection: Phase7Collection, context: Phase7Context): DocumentPlan[] {
  if (collection === "global") return mapGlobal(context);
  if (collection === "home") return mapHome(context);
  return mapBlog(context);
}
