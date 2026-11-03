import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildLegacyMediaManifest,
  classifyMediaReference,
  issueForRemoteCheck,
  loadMediaExclusionRegistry,
  renderManifestSummary,
} from "./lib/legacy-media";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const legacyRoot = path.resolve(scriptDirectory, "../../rbells-tw");
const context = {
  legacyRoot,
  sourceFile: "data/portfolio.js",
  usageType: "structured-data" as const,
};

test("canonicalizes equivalent GCS references", () => {
  const absolute = classifyMediaReference(
    "https://storage.googleapis.com/rbells/assets/example photo.webp?width=640#preview",
    context,
  );
  const relative = classifyMediaReference("assets/example photo.webp", context);

  assert.equal(absolute?.canonical, "gcs://rbells/assets/example%20photo.webp");
  assert.equal(relative?.canonical, absolute?.canonical);
  assert.equal(relative?.kind, "image");
  assert.equal(
    relative?.resolvedUrl,
    "https://storage.googleapis.com/rbells/assets/example%20photo.webp",
  );
});

test("normalizes YouTube URLs to the video id", () => {
  const watch = classifyMediaReference(
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=legacy",
    context,
  );
  const embed = classifyMediaReference(
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    context,
  );

  assert.equal(watch?.canonical, "youtube:dQw4w9WgXcQ");
  assert.equal(embed?.canonical, watch?.canonical);
  assert.equal(watch?.kind, "video");
});

test("rejects ordinary links and CSS font files", () => {
  assert.equal(
    classifyMediaReference("https://policandre.ro/servicii/policandre", context),
    null,
  );
  assert.equal(classifyMediaReference("styles/font-files/Inter.woff2", context), null);
});

test("loads the explicit media exclusion registry", () => {
  const registry = loadMediaExclusionRegistry();
  const canonicalReferences = registry.exclusions.map((entry) => entry.canonical);

  assert.equal(registry.schemaVersion, 1);
  assert.equal(registry.exclusions.length, 78);
  assert.equal(new Set(canonicalReferences).size, 78);
  assert.equal(registry.exclusions.filter((entry) => entry.origin === "cloudinary").length, 46);
  assert.equal(registry.exclusions.filter((entry) => entry.origin === "gcs").length, 28);
  assert.equal(registry.exclusions.filter((entry) => entry.origin === "external").length, 3);
  // The Phase 6 price-list image (decision 2, 2026-11-03).
  assert.equal(registry.exclusions.filter((entry) => entry.origin === "local-public").length, 1);
  assert.ok(registry.exclusions.every((entry) => ["2026-09-20", "2026-11-03"].includes(entry.decisionDate)));
});

test("builds the known legacy portfolio baseline", { skip: !existsSync(legacyRoot) }, async () => {
  const manifest = await buildLegacyMediaManifest({
    legacyRoot,
    hashLocalFiles: false,
    now: new Date("2026-09-07T00:00:00.000Z"),
  });

  assert.equal(manifest.source.repository, "rbells-tw");
  assert.equal(manifest.summary.portfolioProjects, 64);
  assert.equal(manifest.summary.portfolioGalleryItems, 1_860);
  assert.equal(manifest.summary.portfolioVideos, 36);
  assert.equal(manifest.summary.uniqueAssets, 2_534);
  assert.equal(manifest.summary.referencedAssets, 2_429);
  assert.equal(manifest.summary.byOrigin.gcs, 2_242);
  assert.equal(manifest.summary.missingLocalAssets, 1);
  assert.equal(manifest.summary.excludedAssets, 78);
  assert.equal(manifest.summary.includedUnavailableRemoteAssets, 0);
  assert.equal(manifest.source.publicFiles, 207);
  assert.deepEqual(
    manifest.slugConflicts.map((conflict) => conflict.slug),
    ["clopote-sihastria-rascai", "manastirea-faget"],
  );
  assert.ok(manifest.assets.every((asset) => asset.id.length === 64));
  assert.ok(
    manifest.assets.every(
      (asset) =>
        asset.migrationDisposition === "include" ||
        asset.migrationDisposition === "exclude",
    ),
  );
  assert.match(renderManifestSummary(manifest), /cannot discover unreferenced GCS objects/i);
});

test(
  "only explicitly registered unavailable assets are non-blocking",
  { skip: !existsSync(legacyRoot) },
  async () => {
    const manifest = await buildLegacyMediaManifest({
      legacyRoot,
      hashLocalFiles: false,
      now: new Date("2026-09-20T00:00:00.000Z"),
    });
    const excluded = manifest.assets.find(
      (asset) => asset.migrationDisposition === "exclude",
    );
    const included = manifest.assets.find(
      (asset) => asset.migrationDisposition === "include" && asset.resolvedUrl,
    );
    assert.ok(excluded);
    assert.ok(included);

    const unavailable = {
      checkedAt: "2026-09-20T00:00:00.000Z",
      ok: false,
      status: 404,
    };
    const excludedIssue = issueForRemoteCheck({ ...excluded, remote: unavailable });
    const includedIssue = issueForRemoteCheck({ ...included, remote: unavailable });

    assert.equal(excludedIssue?.severity, "warning");
    assert.equal(excludedIssue?.code, "remote-asset-unavailable-excluded");
    assert.equal(includedIssue?.severity, "error");
    assert.equal(includedIssue?.code, "remote-asset-unavailable");
  },
);
