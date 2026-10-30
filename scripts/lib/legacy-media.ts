import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

export const MANIFEST_SCHEMA_VERSION = 2;
export const MEDIA_EXCLUSION_SCHEMA_VERSION = 1;
export const DEFAULT_GCS_BUCKET = "rbells";

const defaultMediaExclusionsFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../config/media-exclusions.json",
);

const MEDIA_EXTENSIONS = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".heic",
  ".heif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".tif",
  ".tiff",
  ".webp",
  ".m4v",
  ".mov",
  ".mp4",
  ".webm",
  ".m4a",
  ".mp3",
  ".ogg",
  ".wav",
  ".pdf",
]);

const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".heic",
  ".heif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".tif",
  ".tiff",
  ".webp",
]);
const VIDEO_EXTENSIONS = new Set([".m4v", ".mov", ".mp4", ".webm"]);
const AUDIO_EXTENSIONS = new Set([".m4a", ".mp3", ".ogg", ".wav"]);
const GCS_RELATIVE_PREFIXES = ["assets/", "lucrarile-noastre/", "policandre_ro/"];
const PUBLIC_RELATIVE_PREFIXES = [
  "audio/",
  "img/",
  "pdf/",
  "services/",
  "works-cover/",
];
const MEDIA_ORIGINS = new Set<MediaOrigin>([
  "gcs",
  "local-public",
  "local-source",
  "cloudinary",
  "youtube",
  "google-drive",
  "site-absolute",
  "external",
]);

export type MediaOrigin =
  | "gcs"
  | "local-public"
  | "local-source"
  | "cloudinary"
  | "youtube"
  | "google-drive"
  | "site-absolute"
  | "external";

export type MediaKind =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "unknown";

export type UsageType =
  | "structured-data"
  | "source-literal"
  | "stylesheet"
  | "public-inventory";

export type MigrationDisposition = "include" | "exclude";

export interface MediaExclusion {
  canonical: string;
  resolvedUrl?: string;
  origin: MediaOrigin;
  reason: string;
  decisionDate: string;
}

export interface MediaExclusionRegistry {
  schemaVersion: number;
  exclusions: MediaExclusion[];
}

export interface MediaUsage {
  sourceFile: string;
  fieldPath: string;
  usageType: UsageType;
  owner?: string;
}

export interface RemoteCheck {
  checkedAt: string;
  ok: boolean;
  status?: number;
  contentType?: string;
  contentLength?: number;
  etag?: string;
  lastModified?: string;
  finalUrl?: string;
  error?: string;
}

export interface ManifestAsset {
  id: string;
  canonical: string;
  origin: MediaOrigin;
  kind: MediaKind;
  extension?: string;
  references: string[];
  resolvedUrl?: string;
  localFile?: string;
  presentInSource: boolean;
  referenced: boolean;
  migrationDisposition: MigrationDisposition;
  exclusion?: MediaExclusion;
  sizeBytes?: number;
  sha256?: string;
  usages: MediaUsage[];
  remote?: RemoteCheck;
}

export interface ManifestIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  assetId?: string;
  sourceFile?: string;
  details?: Record<string, unknown>;
}

export interface PortfolioCollectionSummary {
  collection: string;
  projects: number;
  galleryItems: number;
  videos: number;
}

export interface LegacyMediaManifest {
  schemaVersion: number;
  generatedAt: string;
  source: {
    repository: string;
    gitCommit?: string;
    gcsBucket: string;
    filesScanned: number;
    publicFiles: number;
    publicBytes: number;
  };
  summary: {
    uniqueAssets: number;
    referenceOccurrences: number;
    referencedAssets: number;
    unreferencedPublicAssets: number;
    localAssetsPresent: number;
    missingLocalAssets: number;
    remoteAssets: number;
    remoteChecked: number;
    remoteAvailable: number;
    remoteUnavailable: number;
    excludedAssets: number;
    includedUnavailableRemoteAssets: number;
    issues: number;
    errors: number;
    warnings: number;
    byOrigin: Record<string, number>;
    byKind: Record<string, number>;
    portfolioProjects: number;
    portfolioGalleryItems: number;
    portfolioVideos: number;
  };
  portfolio: PortfolioCollectionSummary[];
  slugConflicts: Array<{ slug: string; owners: string[] }>;
  issues: ManifestIssue[];
  assets: ManifestAsset[];
};

export interface BuildManifestOptions {
  legacyRoot: string;
  checkRemote?: boolean;
  concurrency?: number;
  timeoutMs?: number;
  hashLocalFiles?: boolean;
  now?: Date;
  mediaExclusions?: readonly MediaExclusion[];
  onProgress?: (completed: number, total: number) => void;
}

interface ClassifiedReference {
  canonical: string;
  origin: MediaOrigin;
  kind: MediaKind;
  extension?: string;
  resolvedUrl?: string;
  localFile?: string;
}

interface MutableAsset extends ManifestAsset {
  referenceSet: Set<string>;
  usageKeys: Set<string>;
}

interface AddReferenceContext {
  legacyRoot: string;
  sourceFile: string;
  usageType: UsageType;
  fieldPath: string;
  owner?: string;
}

interface StructuredData {
  file: string;
  value: unknown;
}

export function classifyMediaReference(
  rawReference: string,
  context: Pick<AddReferenceContext, "legacyRoot" | "sourceFile" | "usageType">,
): ClassifiedReference | null {
  const raw = rawReference.trim();
  if (!raw || raw.startsWith("data:")) return null;

  if (/^https?:\/\//i.test(raw)) {
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      return null;
    }

    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname;
    const extension = extensionFromPath(pathname);

    if (isYouTubeHost(hostname)) {
      const videoId = extractYouTubeId(url);
      if (!videoId) return null;
      return {
        canonical: `youtube:${videoId}`,
        origin: "youtube",
        kind: "video",
        resolvedUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };
    }

    const isKnownExtensionlessMediaHost =
      hostname === "storage.googleapis.com" ||
      hostname === "res.cloudinary.com" ||
      hostname === "drive.google.com" ||
      hostname === "images.unsplash.com";

    if (
      (!extension || !MEDIA_EXTENSIONS.has(extension)) &&
      !isKnownExtensionlessMediaHost
    ) {
      return null;
    }

    url.hash = "";
    if (hostname === "storage.googleapis.com") {
      // Legacy width/quality parameters were not GCS transforms. Remove all
      // query parameters to identify the underlying object deterministically.
      url.search = "";
      const parts = pathname.split("/").filter(Boolean);
      const bucket = parts.shift();
      if (!bucket || parts.length === 0) return null;
      const objectPath = encodePath(parts.join("/"));
      return {
        canonical: `gcs://${bucket}/${objectPath}`,
        origin: "gcs",
        kind: kindFromExtension(extension),
        extension,
        resolvedUrl: url.toString(),
      };
    }

    if (hostname === "res.cloudinary.com") {
      url.hash = "";
      return {
        canonical: `cloudinary:${url.origin}${url.pathname}`,
        origin: "cloudinary",
        kind: extension ? kindFromExtension(extension) : "image",
        extension,
        resolvedUrl: url.toString(),
      };
    }

    if (hostname === "drive.google.com") {
      return {
        canonical: `google-drive:${url.origin}${url.pathname}${url.search}`,
        origin: "google-drive",
        kind: kindFromExtension(extension),
        extension,
        resolvedUrl: url.toString(),
      };
    }

    if (hostname === "policandre.ro" || hostname === "www.policandre.ro") {
      url.search = "";
      return {
        canonical: `site:${url.pathname}`,
        origin: "site-absolute",
        kind: kindFromExtension(extension),
        extension,
        resolvedUrl: url.toString(),
      };
    }

    url.search = "";
    return {
      canonical: `external:${url.toString()}`,
      origin: "external",
      kind: kindFromExtension(extension),
      extension,
      resolvedUrl: url.toString(),
    };
  }

  const pathWithoutQuery = stripQueryAndHash(raw);
  const extension = extensionFromPath(pathWithoutQuery);
  if (!extension || !MEDIA_EXTENSIONS.has(extension)) return null;

  const normalized = toPosix(pathWithoutQuery).replace(/^\.\//, "");
  if (normalized.startsWith("/")) {
    const publicPath = normalizeSitePath(normalized);
    return {
      canonical: `local-public:${publicPath}`,
      origin: "local-public",
      kind: kindFromExtension(extension),
      extension,
      localFile: path.join(context.legacyRoot, "public", publicPath.slice(1)),
    };
  }

  if (GCS_RELATIVE_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    const resolvedUrl = gcsObjectUrl(DEFAULT_GCS_BUCKET, normalized);
    return {
      canonical: `gcs://${DEFAULT_GCS_BUCKET}/${encodePath(normalized)}`,
      origin: "gcs",
      kind: kindFromExtension(extension),
      extension,
      resolvedUrl,
    };
  }

  if (PUBLIC_RELATIVE_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    const publicPath = normalizeSitePath(`/${normalized}`);
    return {
      canonical: `local-public:${publicPath}`,
      origin: "local-public",
      kind: kindFromExtension(extension),
      extension,
      localFile: path.join(context.legacyRoot, "public", publicPath.slice(1)),
    };
  }

  if (context.usageType === "stylesheet") {
    const absolute = path.resolve(
      context.legacyRoot,
      path.dirname(context.sourceFile),
      normalized,
    );
    const relative = toPosix(path.relative(context.legacyRoot, absolute));
    return {
      canonical: `local-source:${relative}`,
      origin: "local-source",
      kind: kindFromExtension(extension),
      extension,
      localFile: absolute,
    };
  }

  return null;
}

export function loadMediaExclusionRegistry(
  file = defaultMediaExclusionsFile,
): MediaExclusionRegistry {
  const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Media exclusion registry must be a JSON object: ${file}`);
  }

  const registry = parsed as Record<string, unknown>;
  if (registry.schemaVersion !== MEDIA_EXCLUSION_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported media exclusion registry schema in ${file}: ${String(registry.schemaVersion)}`,
    );
  }
  if (!Array.isArray(registry.exclusions)) {
    throw new Error(`Media exclusion registry must contain an exclusions array: ${file}`);
  }

  const exclusions = registry.exclusions.map((value, index) =>
    parseMediaExclusion(value, `${file} exclusions[${index}]`),
  );
  indexMediaExclusions(exclusions);
  return {
    schemaVersion: MEDIA_EXCLUSION_SCHEMA_VERSION,
    exclusions,
  };
}

export function issueForRemoteCheck(asset: ManifestAsset): ManifestIssue | null {
  if (!asset.remote || asset.remote.ok) return null;

  const excluded = asset.migrationDisposition === "exclude";
  return {
    severity: excluded ? "warning" : "error",
    code: excluded
      ? "remote-asset-unavailable-excluded"
      : "remote-asset-unavailable",
    message: excluded
      ? `Explicitly excluded remote asset remains unavailable: ${asset.canonical}`
      : `Remote asset check failed: ${asset.canonical}`,
    assetId: asset.id,
    sourceFile: asset.usages[0]?.sourceFile,
    details: {
      status: asset.remote.status,
      error: asset.remote.error,
      ...(asset.exclusion
        ? {
            exclusionReason: asset.exclusion.reason,
            exclusionDecisionDate: asset.exclusion.decisionDate,
          }
        : {}),
    },
  };
}

export async function buildLegacyMediaManifest(
  options: BuildManifestOptions,
): Promise<LegacyMediaManifest> {
  const legacyRoot = path.resolve(options.legacyRoot);
  assertLegacyRoot(legacyRoot);

  const now = options.now ?? new Date();
  const generatedAt = now.toISOString();
  const hashLocalFiles = options.hashLocalFiles ?? true;
  const mediaExclusions = options.mediaExclusions ?? loadMediaExclusionRegistry().exclusions;
  const exclusionsByCanonical = indexMediaExclusions(mediaExclusions);
  const assets = new Map<string, MutableAsset>();
  const issues: ManifestIssue[] = [];
  const scannedFiles = new Set<string>();
  let referenceOccurrences = 0;

  const addReference = (raw: string, context: AddReferenceContext) => {
    const classified = classifyMediaReference(raw, context);
    if (!classified) return;
    referenceOccurrences += 1;

    const usage: MediaUsage = {
      sourceFile: toPosix(context.sourceFile),
      fieldPath: context.fieldPath,
      usageType: context.usageType,
      ...(context.owner ? { owner: context.owner } : {}),
    };
    const usageKey = JSON.stringify(usage);
    const existing = assets.get(classified.canonical);
    if (existing) {
      existing.referenceSet.add(raw);
      if (!existing.usageKeys.has(usageKey)) {
        existing.usageKeys.add(usageKey);
        existing.usages.push(usage);
      }
      existing.referenced ||= context.usageType !== "public-inventory";
      return;
    }

    const exclusion = exclusionsByCanonical.get(classified.canonical);
    if (exclusion && exclusion.origin !== classified.origin) {
      throw new Error(
        `Media exclusion origin mismatch for ${classified.canonical}: ` +
          `registry has ${exclusion.origin}, inventory has ${classified.origin}.`,
      );
    }

    const asset: MutableAsset = {
      id: stableId(classified.canonical),
      canonical: classified.canonical,
      origin: classified.origin,
      kind: classified.kind,
      ...(classified.extension ? { extension: classified.extension } : {}),
      references: [raw],
      ...(classified.resolvedUrl ? { resolvedUrl: classified.resolvedUrl } : {}),
      ...(classified.localFile ? { localFile: toPosix(classified.localFile) } : {}),
      presentInSource: false,
      referenced: context.usageType !== "public-inventory",
      migrationDisposition: exclusion ? "exclude" : "include",
      ...(exclusion ? { exclusion } : {}),
      usages: [usage],
      referenceSet: new Set([raw]),
      usageKeys: new Set([usageKey]),
    };
    assets.set(classified.canonical, asset);
  };

  const structuredData = loadStructuredData(legacyRoot);
  for (const source of structuredData) {
    scannedFiles.add(source.file);
    collectStructuredReferences(source.value, {
      legacyRoot,
      sourceFile: source.file,
      usageType: "structured-data",
      fieldPath: "$",
    }, addReference);
  }

  for (const directory of ["components", "pages"]) {
    const absolute = path.join(legacyRoot, directory);
    if (!existsSync(absolute)) continue;
    for (const sourceFile of walkFiles(absolute).filter(isScriptFile)) {
      const relative = toPosix(path.relative(legacyRoot, sourceFile));
      scannedFiles.add(relative);
      collectSourceLiterals(sourceFile, relative, legacyRoot, addReference);
    }
  }

  const stylesRoot = path.join(legacyRoot, "styles");
  if (existsSync(stylesRoot)) {
    for (const sourceFile of walkFiles(stylesRoot).filter((file) => file.endsWith(".css"))) {
      const relative = toPosix(path.relative(legacyRoot, sourceFile));
      scannedFiles.add(relative);
      collectStylesheetReferences(sourceFile, relative, legacyRoot, addReference);
    }
  }

  const publicRoot = path.join(legacyRoot, "public");
  const publicFiles = walkFiles(publicRoot);
  let publicBytes = 0;
  for (const file of publicFiles) {
    const relativeToPublic = toPosix(path.relative(publicRoot, file));
    const relativeToRoot = `public/${relativeToPublic}`;
    const sizeBytes = statSync(file).size;
    publicBytes += sizeBytes;
    addReference(`/${relativeToPublic}`, {
      legacyRoot,
      sourceFile: relativeToRoot,
      usageType: "public-inventory",
      fieldPath: "$file",
    });
    const canonical = `local-public:/${relativeToPublic}`;
    const asset = assets.get(canonical);
    if (asset) {
      asset.presentInSource = true;
      asset.sizeBytes = sizeBytes;
      if (hashLocalFiles) asset.sha256 = sha256File(file);
    }
  }

  for (const asset of assets.values()) {
    if ((asset.origin === "local-public" || asset.origin === "local-source") && asset.localFile) {
      if (existsSync(asset.localFile)) {
        asset.presentInSource = true;
        if (asset.sizeBytes === undefined) asset.sizeBytes = statSync(asset.localFile).size;
        if (hashLocalFiles && !asset.sha256) asset.sha256 = sha256File(asset.localFile);
      } else if (asset.referenced) {
        issues.push({
          severity: "error",
          code: "missing-local-asset",
          message: `Referenced local asset does not exist: ${asset.canonical}`,
          assetId: asset.id,
          sourceFile: asset.usages[0]?.sourceFile,
        });
      }
    }
  }

  const portfolioValue = structuredData.find((entry) => entry.file === "data/portfolio.js")?.value;
  const portfolio = summarizePortfolio(portfolioValue);
  const slugConflicts = findSlugConflicts(portfolioValue);
  for (const conflict of slugConflicts) {
    issues.push({
      severity: "error",
      code: "duplicate-project-slug",
      message: `Project slug '${conflict.slug}' is used by ${conflict.owners.length} records.`,
      sourceFile: "data/portfolio.js",
      details: { owners: conflict.owners },
    });
  }

  if (options.checkRemote) {
    const remoteAssets = [...assets.values()].filter(isCheckableRemoteAsset);
    let remoteCompleted = 0;
    await mapConcurrent(
      remoteAssets,
      options.concurrency ?? 10,
      async (asset) => {
        asset.remote = await checkRemote(asset.resolvedUrl!, generatedAt, options.timeoutMs ?? 15_000);
        const issue = issueForRemoteCheck(asset);
        if (issue) issues.push(issue);
        remoteCompleted += 1;
        options.onProgress?.(remoteCompleted, remoteAssets.length);
      },
    );
  }

  const finalAssets = [...assets.values()]
    .map(finalizeAsset)
    .sort((a, b) => a.canonical.localeCompare(b.canonical));
  issues.sort(compareIssues);

  const remoteChecked = finalAssets.filter((asset) => asset.remote).length;
  const remoteAvailable = finalAssets.filter((asset) => asset.remote?.ok).length;
  const excludedAssets = finalAssets.filter(
    (asset) => asset.migrationDisposition === "exclude",
  ).length;
  const includedUnavailableRemoteAssets = finalAssets.filter(
    (asset) => asset.migrationDisposition === "include" && asset.remote?.ok === false,
  ).length;
  const errors = issues.filter((issue) => issue.severity === "error").length;
  const warnings = issues.length - errors;

  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    generatedAt,
    source: {
      repository: path.basename(legacyRoot),
      gitCommit: getGitCommit(legacyRoot),
      gcsBucket: DEFAULT_GCS_BUCKET,
      filesScanned: scannedFiles.size,
      publicFiles: publicFiles.length,
      publicBytes,
    },
    summary: {
      uniqueAssets: finalAssets.length,
      referenceOccurrences,
      referencedAssets: finalAssets.filter((asset) => asset.referenced).length,
      unreferencedPublicAssets: finalAssets.filter(
        (asset) => asset.origin === "local-public" && asset.presentInSource && !asset.referenced,
      ).length,
      localAssetsPresent: finalAssets.filter(
        (asset) =>
          (asset.origin === "local-public" || asset.origin === "local-source") &&
          asset.presentInSource,
      ).length,
      missingLocalAssets: issues.filter((issue) => issue.code === "missing-local-asset").length,
      remoteAssets: finalAssets.filter(isRemoteAsset).length,
      remoteChecked,
      remoteAvailable,
      remoteUnavailable: remoteChecked - remoteAvailable,
      excludedAssets,
      includedUnavailableRemoteAssets,
      issues: issues.length,
      errors,
      warnings,
      byOrigin: countBy(finalAssets, (asset) => asset.origin),
      byKind: countBy(finalAssets, (asset) => asset.kind),
      portfolioProjects: portfolio.reduce((sum, item) => sum + item.projects, 0),
      portfolioGalleryItems: portfolio.reduce((sum, item) => sum + item.galleryItems, 0),
      portfolioVideos: portfolio.reduce((sum, item) => sum + item.videos, 0),
    },
    portfolio,
    slugConflicts,
    issues,
    assets: finalAssets,
  };
}

export function renderManifestSummary(manifest: LegacyMediaManifest): string {
  const lines = [
    "# Legacy Media Manifest Summary",
    "",
    `Generated: ${manifest.generatedAt}`,
    `Source commit: ${manifest.source.gitCommit ?? "unavailable"}`,
    "",
    "This report is authoritative for active media references found in the legacy",
    "repository and files present under `public/` at the source commit above. It",
    "cannot discover unreferenced GCS objects without a bucket inventory export.",
    "",
    "## Totals",
    "",
    "| Metric | Count |",
    "| --- | ---: |",
    `| Unique assets | ${manifest.summary.uniqueAssets} |`,
    `| Reference occurrences | ${manifest.summary.referenceOccurrences} |`,
    `| Referenced assets | ${manifest.summary.referencedAssets} |`,
    `| Local assets present | ${manifest.summary.localAssetsPresent} |`,
    `| Missing local assets | ${manifest.summary.missingLocalAssets} |`,
    `| Unreferenced public assets | ${manifest.summary.unreferencedPublicAssets} |`,
    `| Remote assets | ${manifest.summary.remoteAssets} |`,
    `| Remote assets checked | ${manifest.summary.remoteChecked} |`,
    `| Remote assets available | ${manifest.summary.remoteAvailable} |`,
    `| Remote assets unavailable | ${manifest.summary.remoteUnavailable} |`,
    `| Assets explicitly excluded from migration | ${manifest.summary.excludedAssets} |`,
    `| Included remote assets unavailable | ${manifest.summary.includedUnavailableRemoteAssets} |`,
    `| Errors | ${manifest.summary.errors} |`,
    `| Warnings | ${manifest.summary.warnings} |`,
    "",
    "## Assets by origin",
    "",
    "| Origin | Count |",
    "| --- | ---: |",
    ...Object.entries(manifest.summary.byOrigin).map(([key, count]) => `| ${key} | ${count} |`),
    "",
    "## Assets by kind",
    "",
    "| Kind | Count |",
    "| --- | ---: |",
    ...Object.entries(manifest.summary.byKind).map(([key, count]) => `| ${key} | ${count} |`),
    "",
    "## Portfolio source totals",
    "",
    "| Collection | Projects | Gallery entries | Videos |",
    "| --- | ---: | ---: | ---: |",
    ...manifest.portfolio.map(
      (item) =>
        `| ${item.collection} | ${item.projects} | ${item.galleryItems} | ${item.videos} |`,
    ),
    "",
    "## Slug conflicts",
    "",
  ];

  if (manifest.slugConflicts.length === 0) {
    lines.push("None.");
  } else {
    for (const conflict of manifest.slugConflicts) {
      lines.push(`- \`${conflict.slug}\`: ${conflict.owners.join("; ")}`);
    }
  }

  lines.push("", "## Issues", "");
  if (manifest.issues.length === 0) {
    lines.push("None.");
  } else {
    const shown = manifest.issues.slice(0, 100);
    for (const issue of shown) {
      lines.push(`- **${issue.severity.toUpperCase()} ${issue.code}:** ${issue.message}`);
    }
    if (shown.length < manifest.issues.length) {
      lines.push(`- ${manifest.issues.length - shown.length} additional issues are recorded in JSON.`);
    }
  }

  const largestLocal = manifest.assets
    .filter((asset) => asset.presentInSource && asset.sizeBytes)
    .sort((a, b) => (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0))
    .slice(0, 20);
  lines.push(
    "",
    "## Largest local assets",
    "",
    "| Asset | Bytes | Referenced |",
    "| --- | ---: | --- |",
    ...largestLocal.map(
      (asset) => `| \`${asset.canonical}\` | ${asset.sizeBytes} | ${asset.referenced ? "yes" : "no"} |`,
    ),
    "",
  );

  return `${lines.join("\n")}\n`;
}

function loadStructuredData(legacyRoot: string): StructuredData[] {
  const definitions: Array<[string, "module" | "json"]> = [
    ["data/portfolio.js", "module"],
    ["data/servicePages.js", "module"],
    ["data/services.js", "module"],
    ["data/catalog.json", "json"],
    ["data/blog.json", "json"],
  ];

  return definitions.map(([file, type]) => {
    const absolute = path.join(legacyRoot, file);
    if (!existsSync(absolute)) throw new Error(`Required legacy data file is missing: ${file}`);
    return {
      file,
      value: type === "json" ? JSON.parse(readFileSync(absolute, "utf8")) : loadDefaultExport(absolute),
    };
  });
}

export function loadDefaultExport(file: string): unknown {
  const source = readFileSync(file, "utf8");
  const transpiled = ts.transpileModule(source, {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  const errors = transpiled.diagnostics?.filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  if (errors?.length) {
    throw new Error(
      `Unable to parse ${file}: ${errors
        .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, " "))
        .join("; ")}`,
    );
  }

  const legacyModule = { exports: {} as Record<string, unknown> };
  const sandbox = {
    module: legacyModule,
    exports: legacyModule.exports,
  };
  vm.runInNewContext(transpiled.outputText, sandbox, {
    filename: file,
    timeout: 2_000,
  });
  return legacyModule.exports.default ?? legacyModule.exports;
}

function collectStructuredReferences(
  value: unknown,
  context: AddReferenceContext,
  addReference: (raw: string, context: AddReferenceContext) => void,
): void {
  if (typeof value === "string") {
    addReference(value, context);
    return;
  }
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      collectStructuredReferences(
        item,
        { ...context, fieldPath: `${context.fieldPath}[${index}]` },
        addReference,
      ),
    );
    return;
  }

  const record = value as Record<string, unknown>;
  const owner = firstText(record.title, record.name, context.owner);
  for (const [key, child] of Object.entries(record)) {
    collectStructuredReferences(
      child,
      {
        ...context,
        fieldPath: `${context.fieldPath}.${key}`,
        ...(owner ? { owner } : {}),
      },
      addReference,
    );
  }
}

function collectSourceLiterals(
  absoluteFile: string,
  relativeFile: string,
  legacyRoot: string,
  addReference: (raw: string, context: AddReferenceContext) => void,
): void {
  const sourceText = readFileSync(absoluteFile, "utf8");
  const scriptKind = absoluteFile.endsWith(".tsx")
    ? ts.ScriptKind.TSX
    : absoluteFile.endsWith(".js") || absoluteFile.endsWith(".jsx")
      ? ts.ScriptKind.JSX
      : ts.ScriptKind.TS;
  const source = ts.createSourceFile(
    relativeFile,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );

  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const start = source.getLineAndCharacterOfPosition(node.getStart(source));
      addReference(node.text, {
        legacyRoot,
        sourceFile: relativeFile,
        usageType: "source-literal",
        fieldPath: `$literal:${start.line + 1}:${start.character + 1}`,
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

function collectStylesheetReferences(
  absoluteFile: string,
  relativeFile: string,
  legacyRoot: string,
  addReference: (raw: string, context: AddReferenceContext) => void,
): void {
  const source = readFileSync(absoluteFile, "utf8");
  const expression = /url\(\s*(['"]?)(.*?)\1\s*\)/g;
  for (const match of source.matchAll(expression)) {
    const line = source.slice(0, match.index).split("\n").length;
    addReference(match[2], {
      legacyRoot,
      sourceFile: relativeFile,
      usageType: "stylesheet",
      fieldPath: `$url:${line}`,
    });
  }
}

function summarizePortfolio(value: unknown): PortfolioCollectionSummary[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>)
    .filter((entry): entry is [string, unknown[]] => Array.isArray(entry[1]))
    .map(([collection, records]) => ({
      collection,
      projects: records.length,
      galleryItems: records.reduce<number>(
        (sum, record) => sum + arrayFieldLength(record, "gallery"),
        0,
      ),
      videos: records.reduce<number>(
        (sum, record) => sum + arrayFieldLength(record, "videoGallery"),
        0,
      ),
    }));
}

function findSlugConflicts(value: unknown): Array<{ slug: string; owners: string[] }> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const usages = new Map<string, string[]>();
  for (const [collection, records] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(records)) continue;
    records.forEach((record, index) => {
      if (!record || typeof record !== "object" || Array.isArray(record)) return;
      const item = record as Record<string, unknown>;
      if (typeof item.page !== "string" || !item.page.trim()) return;
      const owner = firstText(item.title) ?? `record ${index + 1}`;
      const list = usages.get(item.page) ?? [];
      list.push(`${collection}: ${owner}`);
      usages.set(item.page, list);
    });
  }
  return [...usages.entries()]
    .filter(([, owners]) => owners.length > 1)
    .map(([slug, owners]) => ({ slug, owners: owners.sort() }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function parseMediaExclusion(value: unknown, label: string): MediaExclusion {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object.`);
  }

  const entry = value as Record<string, unknown>;
  if (typeof entry.canonical !== "string" || !entry.canonical.trim()) {
    throw new Error(`${label}.canonical must be a non-empty string.`);
  }
  if (typeof entry.origin !== "string" || !MEDIA_ORIGINS.has(entry.origin as MediaOrigin)) {
    throw new Error(`${label}.origin is not a supported media origin.`);
  }
  if (typeof entry.reason !== "string" || !entry.reason.trim()) {
    throw new Error(`${label}.reason must be a non-empty string.`);
  }
  if (typeof entry.decisionDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.decisionDate)) {
    throw new Error(`${label}.decisionDate must use YYYY-MM-DD format.`);
  }
  if (entry.resolvedUrl !== undefined && typeof entry.resolvedUrl !== "string") {
    throw new Error(`${label}.resolvedUrl must be a string when provided.`);
  }

  return {
    canonical: entry.canonical,
    ...(entry.resolvedUrl ? { resolvedUrl: entry.resolvedUrl } : {}),
    origin: entry.origin as MediaOrigin,
    reason: entry.reason,
    decisionDate: entry.decisionDate,
  };
}

function indexMediaExclusions(
  exclusions: readonly MediaExclusion[],
): Map<string, MediaExclusion> {
  const indexed = new Map<string, MediaExclusion>();
  for (const exclusion of exclusions) {
    if (indexed.has(exclusion.canonical)) {
      throw new Error(`Duplicate media exclusion: ${exclusion.canonical}`);
    }
    indexed.set(exclusion.canonical, exclusion);
  }
  return indexed;
}

function finalizeAsset(asset: MutableAsset): ManifestAsset {
  const { referenceSet: _referenceSet, usageKeys: _usageKeys, ...finalAsset } = asset;
  void _referenceSet;
  void _usageKeys;
  finalAsset.references = [...asset.referenceSet].sort();
  finalAsset.usages = [...asset.usages].sort((a, b) => {
    const file = a.sourceFile.localeCompare(b.sourceFile);
    return file || a.fieldPath.localeCompare(b.fieldPath);
  });
  return finalAsset;
}

function assertLegacyRoot(root: string): void {
  for (const required of ["package.json", "data/portfolio.js", "pages", "public"]) {
    if (!existsSync(path.join(root, required))) {
      throw new Error(`Not a supported rbells-tw root; missing ${required} under ${root}`);
    }
  }
}

function walkFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files.sort();
}

function isScriptFile(file: string): boolean {
  return /\.(?:js|jsx|ts|tsx)$/.test(file);
}

function extensionFromPath(value: string): string | undefined {
  const extension = path.posix.extname(stripQueryAndHash(value)).toLowerCase();
  return extension || undefined;
}

function kindFromExtension(extension?: string): MediaKind {
  if (!extension) return "unknown";
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  if (AUDIO_EXTENSIONS.has(extension)) return "audio";
  if (extension === ".pdf") return "document";
  return "unknown";
}

function isYouTubeHost(hostname: string): boolean {
  return hostname === "youtube.com" || hostname === "www.youtube.com" || hostname === "youtu.be";
}

function extractYouTubeId(url: URL): string | undefined {
  if (url.hostname === "youtu.be") return url.pathname.split("/").filter(Boolean)[0];
  if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2];
  return url.searchParams.get("v") ?? undefined;
}

function stripQueryAndHash(value: string): string {
  return value.split("#", 1)[0].split("?", 1)[0];
}

function normalizeSitePath(value: string): string {
  const normalized = path.posix.normalize(toPosix(value));
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function gcsObjectUrl(bucket: string, objectPath: string): string {
  return `https://storage.googleapis.com/${bucket}/${encodePath(objectPath)}`;
}

function encodePath(value: string): string {
  return value
    .split("/")
    .map((segment) => encodeURIComponent(safeDecodeURIComponent(segment)))
    .join("/");
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}

export function stableId(canonical: string): string {
  return createHash("sha256").update(canonical).digest("hex");
}

function sha256File(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function getGitCommit(root: string): string | undefined {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
}

function firstText(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === "string" && value.trim() !== "");
}

function arrayFieldLength(value: unknown, field: string): number {
  if (!value || typeof value !== "object" || Array.isArray(value)) return 0;
  const child = (value as Record<string, unknown>)[field];
  return Array.isArray(child) ? child.length : 0;
}

function countBy<T>(items: T[], selector: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = selector(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function isRemoteAsset(asset: ManifestAsset): boolean {
  return !["local-public", "local-source", "youtube"].includes(asset.origin);
}

function isCheckableRemoteAsset(asset: ManifestAsset): boolean {
  return isRemoteAsset(asset) && Boolean(asset.resolvedUrl);
}

async function checkRemote(
  url: string,
  checkedAt: string,
  timeoutMs: number,
): Promise<RemoteCheck> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      let response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
      });
      if (response.status === 405) {
        response = await fetch(url, {
          method: "GET",
          headers: { Range: "bytes=0-0" },
          redirect: "follow",
          signal: controller.signal,
        });
      }
      clearTimeout(timeout);
      if ((response.status === 429 || response.status >= 500) && attempt < 2) {
        await delay(250 * 2 ** attempt);
        continue;
      }
      const contentRange = response.headers.get("content-range");
      const rangeSize = contentRange?.match(/\/(\d+)$/)?.[1];
      const lengthHeader = rangeSize ?? response.headers.get("content-length");
      return {
        checkedAt,
        ok: response.ok,
        status: response.status,
        ...(response.headers.get("content-type")
          ? { contentType: response.headers.get("content-type")! }
          : {}),
        ...(lengthHeader && Number.isFinite(Number(lengthHeader))
          ? { contentLength: Number(lengthHeader) }
          : {}),
        ...(response.headers.get("etag") ? { etag: response.headers.get("etag")! } : {}),
        ...(response.headers.get("last-modified")
          ? { lastModified: response.headers.get("last-modified")! }
          : {}),
        finalUrl: response.url,
      };
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < 2) {
        await delay(250 * 2 ** attempt);
        continue;
      }
    }
  }
  return {
    checkedAt,
    ok: false,
    error: lastError instanceof Error ? lastError.message : String(lastError),
  };
}

export async function mapConcurrent<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  const bounded = Math.max(1, Math.min(32, Math.floor(concurrency)));
  let nextIndex = 0;
  const runners = Array.from({ length: Math.min(bounded, items.length) }, async () => {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
}

export function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function compareIssues(a: ManifestIssue, b: ManifestIssue): number {
  const severity = a.severity.localeCompare(b.severity);
  const code = a.code.localeCompare(b.code);
  return severity || code || a.message.localeCompare(b.message);
}
