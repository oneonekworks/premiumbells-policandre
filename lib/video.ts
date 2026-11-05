/** The 11-character id of a YouTube watch, share, embed, shorts or live address. */
export function youtubeId(url: string | null | undefined): string | null {
  const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return match?.[1] ?? null;
}
