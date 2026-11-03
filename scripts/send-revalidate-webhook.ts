// Sends a signed test request to the revalidation route, as the Sanity publish
// webhook would. The secret is read from .env.local and never printed.
//
//   npm run revalidate:test -- --url http://127.0.0.1:3100 --type project \
//     --slug drobeta --category <categoryId>
//   npm run revalidate:test -- --url http://127.0.0.1:3100 --type service
//   npm run revalidate:test -- --url http://127.0.0.1:3100 --type catalogItem --family policandre
import {existsSync} from "node:fs";
import path from "node:path";
import {parseArgs} from "node:util";
import {encodeSignatureHeader, SIGNATURE_HEADER_NAME} from "@sanity/webhook";

const envFile = path.join(import.meta.dirname, "..", ".env.local");
if (existsSync(envFile)) process.loadEnvFile(envFile);
const secret = process.env.SANITY_REVALIDATE_SECRET;
if (!secret) throw new Error("SANITY_REVALIDATE_SECRET is not set in .env.local.");

const {values} = parseArgs({
  options: {
    url: {type: "string", default: "http://127.0.0.1:3000"},
    type: {type: "string", default: "project"},
    slug: {type: "string"},
    category: {type: "string"},
    family: {type: "string"},
    operation: {type: "string", default: "update"},
  },
});

async function main(secret: string) {
  const state = values.type === "project"
    ? {slug: values.slug ?? null, category: values.category ?? null, languages: ["ro"]}
    : values.type === "catalogItem" ? {family: values.family ?? null} : null;
  const body = JSON.stringify({_type: values.type, operation: values.operation, before: state, after: state});
  const response = await fetch(new URL("/api/revalidate", values.url), {
    method: "POST",
    headers: {"content-type": "application/json", [SIGNATURE_HEADER_NAME]: await encodeSignatureHeader(body, Date.now(), secret)},
    body,
  });
  console.log(response.status, await response.text());
  if (!response.ok) process.exitCode = 1;
}

main(secret).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
