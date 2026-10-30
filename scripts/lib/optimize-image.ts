import sharp from "sharp";
import {
  sniffFormat,
  stripJpegMetadata,
  stripWebpMetadata,
} from "../../../studio-premiumbells/lib/imageMetadata";

// Node port of the Studio's upload rules (studio-premiumbells/lib/optimizeImage.ts),
// so imported photos match what editors upload from a phone. The lossless
// JPEG/WebP metadata stripping is shared with the Studio; re-encoding uses
// sharp (mozjpeg) instead of a browser canvas, so byte sizes differ slightly.

export const MAX_EDGE = 3200;
export const SIZE_CAP = 1.5 * 1024 * 1024;
export const MIN_SAVING = 0.2;
export const JPEG_QUALITIES = [85, 75, 65];

export type OptimizeMode = "resized" | "kept" | "compressed" | "converted" | "unchanged";

export interface OptimizedImage {
  data: Buffer;
  mode: OptimizeMode;
  /** Output extension without the dot. */
  extension: string;
  width?: number;
  height?: number;
  originalBytes: number;
}

const EXTENSIONS: Record<string, string> = { jpeg: "jpg", png: "png", webp: "webp", gif: "gif", svg: "svg" };

async function encodeJpeg(input: Buffer, quality: number, resize: boolean): Promise<Buffer> {
  let pipeline = sharp(input).rotate();
  if (resize) pipeline = pipeline.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  return pipeline.flatten({ background: "#ffffff" }).jpeg({ quality, mozjpeg: true }).toBuffer();
}

async function result(data: Buffer, mode: OptimizeMode, originalBytes: number): Promise<OptimizedImage> {
  const meta = await sharp(data).metadata().catch(() => undefined);
  const format = meta?.format ?? "";
  return {
    data,
    mode,
    extension: EXTENSIONS[format] ?? format ?? "bin",
    width: meta?.autoOrient?.width ?? meta?.width,
    height: meta?.autoOrient?.height ?? meta?.height,
    originalBytes,
  };
}

/**
 * Same rules as the Studio:
 * 1. JPEG/WebP/PNG within MAX_EDGE and SIZE_CAP keep their pixels; JPEG/WebP
 *    lose metadata losslessly.
 * 2. Within MAX_EDGE but over SIZE_CAP: re-compressed (JPEG 85) only if that
 *    saves at least MIN_SAVING; transparent PNGs are kept.
 * 3. Larger than MAX_EDGE: shrunk (JPEG 85, stepping down to 65 only to stay
 *    within the original size; PNG stays PNG).
 * 4. An EXIF orientation flag or a non-web format is re-encoded once to JPEG.
 */
export async function optimizeImage(input: Buffer): Promise<OptimizedImage> {
  const originalBytes = input.length;
  let meta: sharp.Metadata;
  try {
    meta = await sharp(input).metadata();
  } catch {
    return { data: input, mode: "unchanged", extension: "bin", originalBytes };
  }
  if (meta.format === "svg" || meta.format === "gif") return result(input, "unchanged", originalBytes);

  const width = meta.autoOrient?.width ?? meta.width ?? 0;
  const height = meta.autoOrient?.height ?? meta.height ?? 0;
  const format = sniffFormat(new Uint8Array(input));

  if (Math.max(width, height) > MAX_EDGE) {
    if (format === "png") {
      const png = await sharp(input).rotate()
        .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
        .png({ compressionLevel: 9 }).toBuffer();
      return result(png, "resized", originalBytes);
    }
    let shrunk = await encodeJpeg(input, JPEG_QUALITIES[0], true);
    for (const quality of JPEG_QUALITIES.slice(1)) {
      if (shrunk.length <= originalBytes) break;
      shrunk = await encodeJpeg(input, quality, true);
    }
    return result(shrunk, "resized", originalBytes);
  }

  let kept: Buffer;
  if (format === "png") {
    kept = input;
  } else if (format === "jpeg" || format === "webp") {
    const bytes = new Uint8Array(input);
    const stripped = format === "jpeg" ? stripJpegMetadata(bytes) : stripWebpMetadata(bytes);
    if ((stripped?.orientation ?? 1) !== 1) {
      return result(await encodeJpeg(input, JPEG_QUALITIES[0], false), "converted", originalBytes);
    }
    kept = stripped ? Buffer.from(stripped.data) : input;
  } else {
    return result(await encodeJpeg(input, JPEG_QUALITIES[0], false), "converted", originalBytes);
  }

  const keptMode: OptimizeMode = kept.equals(input) ? "unchanged" : "kept";
  if (kept.length <= SIZE_CAP) return result(kept, keptMode, originalBytes);
  if (format === "png" && !(await sharp(input).stats()).isOpaque) return result(kept, keptMode, originalBytes);

  const compressed = await encodeJpeg(input, JPEG_QUALITIES[0], false);
  return compressed.length <= kept.length * (1 - MIN_SAVING)
    ? result(compressed, "compressed", originalBytes)
    : result(kept, keptMode, originalBytes);
}
