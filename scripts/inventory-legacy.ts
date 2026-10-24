#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildLegacyMediaManifest,
  renderManifestSummary,
} from "./lib/legacy-media";

interface CliOptions {
  legacyRoot: string;
  outputDirectory: string;
  checkRemote: boolean;
  concurrency: number;
  timeoutMs: number;
  strict: boolean;
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");

async function main(): Promise<void> {
  const options = parseArguments(process.argv.slice(2));
  let lastProgress = 0;

  console.log(`Legacy root: ${options.legacyRoot}`);
  console.log(`Output: ${options.outputDirectory}`);
  console.log(`Remote validation: ${options.checkRemote ? "enabled" : "disabled"}`);

  const manifest = await buildLegacyMediaManifest({
    legacyRoot: options.legacyRoot,
    checkRemote: options.checkRemote,
    concurrency: options.concurrency,
    timeoutMs: options.timeoutMs,
    onProgress: (completed, total) => {
      const percentage = total === 0 ? 100 : Math.floor((completed / total) * 100);
      if (percentage >= lastProgress + 5 || completed === total) {
        lastProgress = percentage;
        console.log(`Remote checks: ${completed}/${total} (${percentage}%)`);
      }
    },
  });

  await mkdir(options.outputDirectory, { recursive: true });
  const jsonPath = path.join(options.outputDirectory, "legacy-media-manifest.json");
  const summaryPath = path.join(options.outputDirectory, "legacy-media-summary.md");
  await Promise.all([
    writeFile(jsonPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8"),
    writeFile(summaryPath, renderManifestSummary(manifest), "utf8"),
  ]);

  console.log("");
  console.log(`Unique assets: ${manifest.summary.uniqueAssets}`);
  console.log(`Reference occurrences: ${manifest.summary.referenceOccurrences}`);
  console.log(`Missing local assets: ${manifest.summary.missingLocalAssets}`);
  if (options.checkRemote) {
    console.log(
      `Remote availability: ${manifest.summary.remoteAvailable}/${manifest.summary.remoteChecked}`,
    );
    console.log(
      `Included unavailable remote assets: ${manifest.summary.includedUnavailableRemoteAssets}`,
    );
  }
  console.log(`Explicitly excluded assets: ${manifest.summary.excludedAssets}`);
  console.log(`Issues: ${manifest.summary.errors} errors, ${manifest.summary.warnings} warnings`);
  console.log(`JSON manifest: ${jsonPath}`);
  console.log(`Summary: ${summaryPath}`);

  if (options.strict && manifest.summary.errors > 0) {
    console.error("Strict mode failed because the manifest contains errors.");
    process.exitCode = 1;
  }
}

function parseArguments(args: string[]): CliOptions {
  const options: CliOptions = {
    legacyRoot: path.resolve(repositoryRoot, "../rbells-tw"),
    outputDirectory: path.resolve(repositoryRoot, ".migration"),
    checkRemote: false,
    concurrency: 10,
    timeoutMs: 15_000,
    strict: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    switch (argument) {
      case "--legacy-root":
        options.legacyRoot = path.resolve(requireValue(args, ++index, argument));
        break;
      case "--output":
        options.outputDirectory = path.resolve(requireValue(args, ++index, argument));
        break;
      case "--check-remote":
        options.checkRemote = true;
        break;
      case "--concurrency":
        options.concurrency = positiveInteger(requireValue(args, ++index, argument), argument);
        break;
      case "--timeout-ms":
        options.timeoutMs = positiveInteger(requireValue(args, ++index, argument), argument);
        break;
      case "--strict":
        options.strict = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${argument}. Use --help for usage.`);
    }
  }

  if (options.concurrency > 32) {
    throw new Error("--concurrency must be between 1 and 32.");
  }
  return options;
}

function requireValue(args: string[], index: number, argument: string): string {
  const value = args[index];
  if (!value || value.startsWith("--")) {
    throw new Error(`${argument} requires a value.`);
  }
  return value;
}

function positiveInteger(value: string, argument: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${argument} must be a positive integer.`);
  }
  return parsed;
}

function printHelp(): void {
  console.log(`Usage: npm run inventory:legacy -- [options]

Build a deterministic inventory of active legacy media references and every
file under the legacy public directory. The command never modifies the legacy
repository or remote assets.

Options:
  --legacy-root <path>  Legacy rbells-tw root (default: ../rbells-tw)
  --output <path>       Report directory (default: .migration)
  --check-remote        HEAD-check referenced remote assets
  --concurrency <n>     Remote request concurrency, 1-32 (default: 10)
  --timeout-ms <n>      Per remote attempt timeout (default: 15000)
  --strict              Exit non-zero when manifest errors are present
  --help, -h            Show this help

Outputs:
  .migration/legacy-media-manifest.json
  .migration/legacy-media-summary.md
`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
