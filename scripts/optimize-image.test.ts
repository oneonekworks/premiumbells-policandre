import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { MAX_EDGE, optimizeImage } from "./lib/optimize-image";

const noisy = (width: number, height: number) => {
  // Random pixels compress poorly, like real photos, so size rules are exercised.
  const pixels = Buffer.alloc(width * height * 3);
  for (let i = 0; i < pixels.length; i += 1) pixels[i] = (i * 2654435761) >>> 24;
  return sharp(pixels, { raw: { width, height, channels: 3 } });
};

test("shrinks photos larger than the maximum edge", async () => {
  const input = await noisy(4000, 3000).jpeg({ quality: 95 }).toBuffer();
  const result = await optimizeImage(input);
  assert.equal(result.mode, "resized");
  assert.equal(result.width, MAX_EDGE);
  assert.equal(result.height, 2400);
  assert.ok(result.data.length <= input.length);
});

test("keeps small photos byte for byte apart from metadata", async () => {
  const clean = await noisy(400, 300).jpeg({ quality: 80 }).toBuffer();
  const withExif = await sharp(clean).withExif({ IFD0: { Make: "Legacy camera" } }).jpeg({ quality: 80 }).toBuffer();
  const result = await optimizeImage(withExif);
  assert.equal(result.mode, "kept");
  assert.equal((await sharp(result.data).metadata()).exif, undefined);
  assert.ok(result.data.length < withExif.length);

  const unchanged = await optimizeImage(clean);
  assert.equal(unchanged.mode, "unchanged");
  assert.ok(unchanged.data.equals(clean));
});

test("re-encodes photos with an orientation flag upright", async () => {
  const input = await noisy(400, 300).withMetadata({ orientation: 6 }).jpeg().toBuffer();
  const result = await optimizeImage(input);
  assert.equal(result.mode, "converted");
  assert.deepEqual([result.width, result.height], [300, 400]);
  assert.equal((await sharp(result.data).metadata()).orientation, undefined);
});

test("leaves GIFs and undecodable files unchanged", async () => {
  const gif = await sharp({ create: { width: 10, height: 10, channels: 3, background: "#000" } }).gif().toBuffer();
  assert.equal((await optimizeImage(gif)).mode, "unchanged");
  assert.equal((await optimizeImage(Buffer.from("not an image"))).mode, "unchanged");
});
