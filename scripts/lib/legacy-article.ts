import { readFileSync } from "node:fs";
import ts from "typescript";

// Converts a legacy article page (pages/blog/*.js) to `articleBody` Portable
// Text by reading its JSX tree with the TypeScript parser; nothing is
// executed. Commented-out code never reaches the tree. `{post.x}` expressions
// resolve against the page's blog.json record. Every element the converter
// does not know blocks the article and is named in the issues.
//
// Whitespace follows the browser (runs collapse to one space, also across a
// line break next to <strong>), not the JSX rule that drops it: the legacy
// pages relied on the browser and several of them lose a space under JSX
// ("Stareț,arhimandritul").

export type Span = { _type: "span"; _key: string; text: string; marks: string[] };
export type TextBlock = {
  _type: "block"; _key: string; style: "normal" | "h2" | "h3" | "blockquote";
  listItem?: "bullet" | "number"; level?: number; markDefs: never[]; children: Span[];
};
/** Media before resolution: the importer turns `src` into an asset reference. */
export type FigureBlock = { _type: "figure"; _key: string; src: string; alt: string };
export type VideoBlock = { _type: "video"; _key: string; provider: "youtube"; url: string };
export type DroppedVideo = { _type: "droppedVideo"; _key: string; src: string };
export type ArticleBlock = TextBlock | FigureBlock | VideoBlock | DroppedVideo;

export type ArticleIssue = { severity: "error" | "warning"; code: string; message: string };

type Inline = { text: string; marks: string[] } | { lineBreak: true };

// Layout and chrome around the article that carry no content.
const IGNORED_ELEMENTS = new Set(["h1", "svg", "Breadcrumb", "HeaderNavigation", "Footer", "Fancybox", "Image"]);
const CONTAINERS = new Set(["div", "section", "article", "main"]);
const INLINE_MARKS: Record<string, string> = { strong: "strong", b: "strong", em: "em", i: "em" };

const keyOf = (prefix: string, index: number) => `${prefix}${String(index).padStart(3, "0")}`;

/** Inline HTML from blog.json: only <strong>, <b>, <em>, <i> and <br>; anything else is an issue. */
export function htmlToInline(html: string, issues: ArticleIssue[], where: string): Inline[] {
  const out: Inline[] = [];
  const marks: string[] = [];
  for (const token of html.split(/(<[^>]+>)/)) {
    if (!token) continue;
    const tag = token.match(/^<\s*(\/?)\s*([a-z]+)[^>]*?(\/?)\s*>$/i);
    if (!tag) {
      out.push({ text: decodeEntities(token), marks: [...marks] });
      continue;
    }
    const [, closing, name] = tag;
    const lower = name.toLowerCase();
    if (lower === "br") out.push({ lineBreak: true });
    else if (INLINE_MARKS[lower]) {
      if (closing) marks.splice(marks.lastIndexOf(INLINE_MARKS[lower]), 1);
      else marks.push(INLINE_MARKS[lower]);
    } else issues.push({ severity: "error", code: "unknown-html", message: `${where}: <${lower}> is not converted.` });
  }
  return out;
}

const decodeEntities = (text: string) =>
  text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/** Inline parts to spans: whitespace collapsed, ends trimmed, neighbours with the same marks merged. */
export function toSpans(parts: Inline[], keyPrefix: string): Span[] {
  const spans: Array<{ text: string; marks: string[] }> = [];
  for (const part of parts) {
    // Line breaks inside paragraphs only occur in blog.json HTML; Portable Text keeps them as "\n".
    const text = "lineBreak" in part ? "\n" : part.text.replace(/\u200b/g, "").replace(/\s+/g, " ");
    const marks = "lineBreak" in part ? [] : part.marks;
    const last = spans.at(-1);
    if (last && last.marks.join() === marks.join()) last.text += text;
    else spans.push({ text, marks: [...marks] });
  }
  // Collapse spaces across span boundaries, then trim the block.
  for (let index = 1; index < spans.length; index += 1) {
    if (/ $/.test(spans[index - 1].text) || /\n$/.test(spans[index - 1].text)) spans[index].text = spans[index].text.replace(/^ +/, "");
  }
  for (const span of spans) span.text = span.text.replace(/ {2,}/g, " ").replace(/ *\n */g, "\n");
  if (spans.length) {
    spans[0].text = spans[0].text.replace(/^\s+/, "");
    spans[spans.length - 1].text = spans[spans.length - 1].text.replace(/\s+$/, "");
  }
  // A space at the edge of a marked span moves outside the mark.
  const result: Array<{ text: string; marks: string[] }> = [];
  for (const span of spans.filter((item) => item.text)) {
    if (!span.marks.length) { result.push(span); continue; }
    const lead = span.text.match(/^ +/)?.[0] ?? "";
    const trail = span.text.match(/ +$/)?.[0] ?? "";
    if (lead) result.push({ text: lead, marks: [] });
    result.push({ text: span.text.trim(), marks: span.marks });
    if (trail) result.push({ text: trail, marks: [] });
  }
  const merged: Array<{ text: string; marks: string[] }> = [];
  for (const span of result) {
    const last = merged.at(-1);
    if (last && last.marks.join() === span.marks.join()) last.text += span.text;
    else merged.push(span);
  }
  return merged.map((span, index) => ({ _type: "span", _key: `${keyPrefix}s${index}`, text: span.text, marks: span.marks }));
}

const tagName = (node: ts.JsxElement | ts.JsxSelfClosingElement) =>
  (ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName).getText();
const attributesOf = (node: ts.JsxElement | ts.JsxSelfClosingElement) =>
  (ts.isJsxElement(node) ? node.openingElement.attributes : node.attributes).properties;

export interface ConvertOptions {
  /** The blog.json record bound to `post` (or `posts[n]`) on the page. */
  post?: Record<string, unknown>;
}

/** Path like `post.pictures[0]` evaluated against the bound record. */
function resolveExpression(expression: ts.Expression, post: Record<string, unknown> | undefined): unknown {
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
  if (ts.isParenthesizedExpression(expression)) return resolveExpression(expression.expression, post);
  if (ts.isIdentifier(expression)) return expression.text === "post" ? post : undefined;
  if (ts.isPropertyAccessExpression(expression)) {
    const base = resolveExpression(expression.expression, post) as Record<string, unknown> | undefined;
    return base?.[expression.name.text];
  }
  if (ts.isElementAccessExpression(expression) && ts.isNumericLiteral(expression.argumentExpression)) {
    const base = resolveExpression(expression.expression, post) as unknown[] | undefined;
    return Array.isArray(base) ? base[Number(expression.argumentExpression.text)] : undefined;
  }
  return undefined;
}

/** The JSX returned by the page's default-exported component. */
function pageJsx(source: ts.SourceFile): ts.JsxElement | undefined {
  let found: ts.JsxElement | undefined;
  for (const statement of source.statements) {
    const isDefault = ts.isFunctionDeclaration(statement)
      && statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);
    if (!isDefault || !statement.body) continue;
    const visit = (node: ts.Node) => {
      if (found) return;
      if (ts.isReturnStatement(node) && node.expression) {
        const value = ts.isParenthesizedExpression(node.expression) ? node.expression.expression : node.expression;
        if (ts.isJsxElement(value)) found = value;
        return;
      }
      if (!ts.isFunctionLike(node) || node === statement) ts.forEachChild(node, visit);
    };
    visit(statement.body);
  }
  return found;
}

export function convertArticle(file: string, options: ConvertOptions = {}): { blocks: ArticleBlock[]; issues: ArticleIssue[] } {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX);
  const issues: ArticleIssue[] = [];
  const blocks: ArticleBlock[] = [];
  const root = pageJsx(source);
  if (!root) return { blocks, issues: [{ severity: "error", code: "no-jsx", message: `${file}: no default-exported component JSX found.` }] };

  const where = (node: ts.Node) => `${file}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;
  const attribute = (node: ts.JsxElement | ts.JsxSelfClosingElement, name: string): unknown => {
    for (const property of attributesOf(node)) {
      if (!ts.isJsxAttribute(property) || property.name.getText() !== name) continue;
      const initializer = property.initializer;
      if (!initializer) return true;
      if (ts.isStringLiteral(initializer)) return initializer.text;
      if (ts.isJsxExpression(initializer) && initializer.expression) {
        const expression = initializer.expression;
        // dangerouslySetInnerHTML={{ __html: post.headline }}
        if (ts.isObjectLiteralExpression(expression)) {
          const html = expression.properties.find((item) => item.name?.getText() === "__html");
          return html && ts.isPropertyAssignment(html) ? { __html: resolveExpression(html.initializer, options.post) } : undefined;
        }
        return resolveExpression(expression, options.post);
      }
    }
    return undefined;
  };

  /** Inline content of a text element; block elements inside are issues. */
  const inline = (node: ts.JsxElement, marks: string[] = []): Inline[] => node.children.flatMap((child): Inline[] => {
    if (ts.isJsxText(child)) return [{ text: child.text, marks }];
    if (ts.isJsxExpression(child)) {
      if (!child.expression) return [];
      const value = resolveExpression(child.expression, options.post);
      if (typeof value === "string") return [{ text: value, marks }];
      issues.push({ severity: "error", code: "unresolved-expression", message: `${where(child)}: {${child.expression.getText()}} does not resolve to text.` });
      return [];
    }
    if (ts.isJsxSelfClosingElement(child) && tagName(child) === "br") return [{ lineBreak: true }];
    if (ts.isJsxElement(child)) {
      const name = tagName(child);
      if (INLINE_MARKS[name]) return inline(child, [...marks, INLINE_MARKS[name]]);
      if (name === "span") return inline(child, marks);
      issues.push({ severity: "error", code: "unknown-inline", message: `${where(child)}: <${name}> inside text is not converted.` });
      return [];
    }
    issues.push({ severity: "error", code: "unknown-inline", message: `${where(child)}: unsupported inline content.` });
    return [];
  });

  const textBlock = (parts: Inline[], style: TextBlock["style"], list?: TextBlock["listItem"]) => {
    const key = keyOf("b", blocks.length);
    const children = toSpans(parts, key);
    if (!children.length) return;
    blocks.push({ _type: "block", _key: key, style, ...(list ? { listItem: list, level: 1 } : {}), markDefs: [], children });
  };

  /** <p dangerouslySetInnerHTML={{ __html: post.x }} />: the blog.json HTML string. */
  const paragraphHtml = (node: ts.JsxElement | ts.JsxSelfClosingElement, style: TextBlock["style"]) => {
    const html = attribute(node, "dangerouslySetInnerHTML") as { __html?: unknown } | undefined;
    if (typeof html?.__html !== "string") {
      issues.push({ severity: "error", code: "unresolved-expression", message: `${where(node)}: dangerouslySetInnerHTML does not resolve to text.` });
      return;
    }
    textBlock(htmlToInline(html.__html, issues, where(node)), style);
  };
  const paragraph = (node: ts.JsxElement, style: TextBlock["style"]) =>
    attribute(node, "dangerouslySetInnerHTML") ? paragraphHtml(node, style) : textBlock(inline(node), style);

  const visit = (node: ts.JsxChild) => {
    if (ts.isJsxText(node)) {
      if (node.text.trim()) issues.push({ severity: "error", code: "loose-text", message: `${where(node)}: text outside a paragraph: „${node.text.trim().slice(0, 60)}”` });
      return;
    }
    if (ts.isJsxExpression(node)) {
      if (node.expression) issues.push({ severity: "error", code: "unknown-expression", message: `${where(node)}: {${node.expression.getText().slice(0, 60)}} between blocks.` });
      return;
    }
    if (ts.isJsxFragment(node)) return node.children.forEach(visit);
    if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) return;
    const name = tagName(node);
    if (IGNORED_ELEMENTS.has(name) || attribute(node, "aria-hidden") === "true") return;

    if (name === "img" || name === "iframe" || name === "source") {
      const src = attribute(node, "src");
      if (typeof src !== "string") {
        issues.push({ severity: "error", code: "unresolved-media", message: `${where(node)}: <${name}> without a resolvable src.` });
        return;
      }
      if (name === "img") {
        const alt = attribute(node, "alt");
        blocks.push({ _type: "figure", _key: keyOf("f", blocks.length), src, alt: typeof alt === "string" ? alt.trim() : "" });
      } else if (name === "iframe") {
        const id = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/)?.[1];
        if (id) blocks.push({ _type: "video", _key: keyOf("v", blocks.length), provider: "youtube", url: `https://www.youtube.com/watch?v=${id}` });
        else issues.push({ severity: "error", code: "unknown-embed", message: `${where(node)}: iframe ${src} is not YouTube.` });
      } else {
        blocks.push({ _type: "droppedVideo", _key: keyOf("x", blocks.length), src });
      }
      return;
    }
    if (ts.isJsxSelfClosingElement(node)) {
      if (name === "p" && attribute(node, "dangerouslySetInnerHTML")) return paragraphHtml(node, "normal");
      issues.push({ severity: "error", code: "unknown-element", message: `${where(node)}: <${name} /> is not converted.` });
      return;
    }

    // The fallback text inside <video> is not content; only its <source> counts.
    if (name === "video") return node.children.forEach((child) => { if (!ts.isJsxText(child)) visit(child); });
    if (CONTAINERS.has(name) || name === "figure") return node.children.forEach(visit);
    if (name === "p") return paragraph(node, "normal");
    if (name === "h2" || name === "h3") return paragraph(node, name);
    if (name === "blockquote") {
      for (const child of node.children) {
        if (ts.isJsxElement(child) && tagName(child) === "p") paragraph(child, "blockquote");
        else if (!ts.isJsxText(child) || child.text.trim()) issues.push({ severity: "error", code: "unknown-element", message: `${where(child)}: only <p> is converted inside <blockquote>.` });
      }
      return;
    }
    if (name === "ul" || name === "ol") {
      for (const child of node.children) {
        if (ts.isJsxElement(child) && tagName(child) === "li") textBlock(inline(child), "normal", name === "ul" ? "bullet" : "number");
        else if (!ts.isJsxText(child) || child.text.trim()) issues.push({ severity: "error", code: "unknown-element", message: `${where(child)}: only <li> is converted inside <${name}>.` });
      }
      return;
    }
    issues.push({ severity: "error", code: "unknown-element", message: `${where(node)}: <${name}> is not converted.` });
  };

  root.children.forEach(visit);
  if (ts.isJsxElement(root) && !CONTAINERS.has(tagName(root))) issues.push({ severity: "warning", code: "root", message: `${file}: root <${tagName(root)}> walked as a container.` });
  return { blocks, issues };
}

/** Block counts for reconciliation and the migration tests. */
export function countBlocks(blocks: Array<{ _type: string; style?: string; listItem?: string }>) {
  const count = (test: (block: (typeof blocks)[number]) => boolean) => blocks.filter(test).length;
  return {
    paragraphs: count((block) => block._type === "block" && block.style === "normal" && !block.listItem),
    headings: count((block) => block._type === "block" && (block.style === "h2" || block.style === "h3")),
    quotes: count((block) => block._type === "block" && block.style === "blockquote"),
    listItems: count((block) => block._type === "block" && Boolean(block.listItem)),
    figures: count((block) => block._type === "figure" || block._type === "imageWithMetadata"),
    embeds: count((block) => block._type === "video"),
  };
}
